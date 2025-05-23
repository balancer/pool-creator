import { useEffect } from "react";
import { formatUnits } from "viem";
import { useEclpTokenOrder } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { useFetchTokenRate, usePoolCreationStore } from "~~/hooks/v3";

// TODO: simplify to just always adjust usd value for token by rate if a rate provider is being used?
export const useEclpSpotPrice = () => {
  const { updateEclpParam, eclpParams } = usePoolCreationStore();
  const { usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

  const sortedTokens = useEclpTokenOrder();

  // fetch usd per token from API
  const { tokenUsdValue: usdPerToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdPerToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  const { data: currentRateToken0 } = useFetchTokenRate(sortedTokens[0].rateProvider);
  const { data: currentRateToken1 } = useFetchTokenRate(sortedTokens[1].rateProvider);

  // When user sets useBoostedVariant to true, the tokenConfigs in local state will naturally be underlying, so we dont want to use underlying in that case
  const shouldUseUnderlyingToken0 = currentRateToken0 && usdPerToken0 && !sortedTokens[0].useBoostedVariant;
  const shouldUseUnderlyingToken1 = currentRateToken1 && usdPerToken1 && !sortedTokens[1].useBoostedVariant;

  // calculate usd per underlying token
  const usdPerUnderlyingToken0 = shouldUseUnderlyingToken0 && usdPerToken0 / Number(formatUnits(currentRateToken0, 18));
  const usdPerUnderlyingToken1 = shouldUseUnderlyingToken1 && usdPerToken1 / Number(formatUnits(currentRateToken1, 18));

  // use usd per underlying token if available, otherwise use usd per token
  const valueToken0 = shouldUseUnderlyingToken0 ? usdPerUnderlyingToken0 : usdPerToken0;
  const valueToken1 = shouldUseUnderlyingToken1 ? usdPerUnderlyingToken1 : usdPerToken1;

  // auto-fill usd per token input field values to start
  useEffect(() => {
    updateEclpParam({
      usdPerTokenInput0: usdPerTokenInput0 ? usdPerTokenInput0 : valueToken0 ? valueToken0.toString() : "",
    });
  }, [valueToken0, updateEclpParam, usdPerTokenInput0]);

  useEffect(() => {
    updateEclpParam({
      usdPerTokenInput1: usdPerTokenInput1 ? usdPerTokenInput1 : valueToken1 ? valueToken1.toString() : "",
    });
  }, [valueToken1, updateEclpParam, usdPerTokenInput1]);

  const parsedUsdPerTokenInput0 = Number(usdPerTokenInput0);
  const parsedUsdPerTokenInput1 = Number(usdPerTokenInput1);
  const poolSpotPrice =
    parsedUsdPerTokenInput0 && parsedUsdPerTokenInput1 ? parsedUsdPerTokenInput0 / parsedUsdPerTokenInput1 : null;

  return { poolSpotPrice };
};
