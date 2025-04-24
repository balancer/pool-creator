import { useEffect } from "react";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents, formatEclpParamValues } from "~~/utils/gryo";
import { sortTokenConfigs } from "~~/utils/helpers";

export function useAutofillStarterParams() {
  const { eclpParams, tokenConfigs, updateEclpParam } = usePoolCreationStore();
  const { isTokenOrderInverted, usdValueToken0, usdValueToken1 } = eclpParams;
  const { hasEditedEclpTokenUsdValues, hasEditedEclpParams } = useUserDataStore();

  const sortedTokens = sortTokenConfigs(tokenConfigs).map(token => ({
    address: token.address,
    symbol: token.tokenInfo?.symbol,
  }));
  if (isTokenOrderInverted) sortedTokens.reverse();

  // 1. Fetch token prices from API to auto-fill USD values for tokens
  const { tokenUsdValue: usdValueFromApiToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdValueFromApiToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  useEffect(() => {
    if (!hasEditedEclpTokenUsdValues && usdValueFromApiToken0 && usdValueFromApiToken1) {
      updateEclpParam({
        usdValueToken0: usdValueFromApiToken0.toString(),
        usdValueToken1: usdValueFromApiToken1.toString(),
      });
    }
  }, [usdValueFromApiToken0, usdValueFromApiToken1, updateEclpParam, hasEditedEclpTokenUsdValues]);

  // 2. Use token usd values to calculate spot price
  let poolSpotPrice = null;
  // Using persistant state values intead of api values directly incase user changes them
  if (usdValueToken0 && usdValueToken1) poolSpotPrice = Number(usdValueToken0) / Number(usdValueToken1);

  // 3. Use spot price to calculate starting params for eclp curve
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
