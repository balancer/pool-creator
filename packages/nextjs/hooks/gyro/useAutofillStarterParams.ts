import { useEffect } from "react";
import { useEclpSpotPrice } from "./";
import { formatUnits } from "viem";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents, formatEclpParamValues } from "~~/utils/gryo";
import { sortTokenConfigs } from "~~/utils/helpers";

export function useAutofillStarterParams() {
  const { eclpParams, tokenConfigs, updateEclpParam } = usePoolCreationStore();
  const { isEclpParamsInverted, usdValueToken0, usdValueToken1, hasFetchedUsdValueToken0, hasFetchedUsdValueToken1 } =
    eclpParams;
  const { hasEditedEclpParams } = useUserDataStore();

  const poolSpotPrice = useEclpSpotPrice();

  const sortedTokens = sortTokenConfigs(tokenConfigs).map(token => ({
    address: token.address,
    symbol: token.tokenInfo?.symbol,
    currentRate: token.currentRate,
  }));
  if (isEclpParamsInverted) sortedTokens.reverse();

  // Fetch token prices from API to auto-fill USD values for tokens
  const { tokenUsdValue: usdValueFromApiToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdValueFromApiToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  useEffect(() => {
    if (!hasFetchedUsdValueToken0 && usdValueFromApiToken0) {
      const currentRate = sortedTokens[0].currentRate;
      // If token is using rate provider, use it to convert the USD price to that of the underlying token
      // for the user input that sets usd value of token
      const usdValueToken0 = currentRate
        ? usdValueFromApiToken0 / Number(formatUnits(currentRate, 18))
        : usdValueFromApiToken0;
      updateEclpParam({
        usdValueToken0: usdValueToken0.toString(), // need string because this state is for input field
        hasFetchedUsdValueToken0: true,
        isUnderlyingUsdValueToken0: currentRate !== undefined,
      });
    }
    if (!hasFetchedUsdValueToken1 && usdValueFromApiToken1) {
      const currentRate = sortedTokens[1].currentRate;
      // If token is using rate provider, use it to convert the USD price to that of the underlying token
      // for the user input that sets usd value of token
      const usdValueToken1 = currentRate
        ? usdValueFromApiToken1 / Number(formatUnits(currentRate, 18))
        : usdValueFromApiToken1;
      updateEclpParam({
        usdValueToken1: usdValueToken1.toString(), // need string because this state is for input field
        hasFetchedUsdValueToken1: true,
        isUnderlyingUsdValueToken1: currentRate !== undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    usdValueFromApiToken0,
    usdValueFromApiToken1,
    updateEclpParam,
    hasFetchedUsdValueToken0,
    hasFetchedUsdValueToken1,
  ]);

  // Use pool spot price (which depends on usdValueToken0 and usdValueToken1) to calculate starting params for eclp curve
  useEffect(() => {
    if (poolSpotPrice) {
      if (!hasEditedEclpParams) {
        const { c, s } = calculateRotationComponents(poolSpotPrice.toString());
        const lowestPrice = poolSpotPrice - poolSpotPrice * 0.1;
        const highestPrice = poolSpotPrice + poolSpotPrice * 0.1;

        updateEclpParam({
          alpha: formatEclpParamValues(lowestPrice),
          beta: formatEclpParamValues(highestPrice),
          c,
          s,
          lambda: "1000", // TODO: formula for lambda with consistent curve? maybe something logarithmic?
          peakPrice: formatEclpParamValues(poolSpotPrice),
        });
      }
    } else {
      // without pool spot price, can't calculate "starter" rotation component values
      updateEclpParam({ alpha: "", beta: "", c: "", s: "", peakPrice: "", lambda: "" });
    }
  }, [poolSpotPrice, updateEclpParam, hasEditedEclpParams, usdValueToken0, usdValueToken1]);
}
