import { useEffect } from "react";
import { formatUnits } from "viem";
import { useEclpTokenOrder } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

export const useEclpSpotPrice = () => {
  const { updateEclpParam, eclpParams } = usePoolCreationStore();
  const { usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

  const sortedTokens = useEclpTokenOrder();

  // fetch usd per token from API
  const { tokenUsdValue: usdPerToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdPerToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  // calculate usd per underlying token
  const currentRateToken0 = sortedTokens[0].currentRate;
  const currentRateToken1 = sortedTokens[1].currentRate;

  const shouldUseUnderlyingToken0 = currentRateToken0 && usdPerToken0;
  const shouldUseUnderlyingToken1 = currentRateToken1 && usdPerToken1;

  const usdPerUnderlyingToken0 = shouldUseUnderlyingToken0 && usdPerToken0 / Number(formatUnits(currentRateToken0, 18));
  const usdPerUnderlyingToken1 = shouldUseUnderlyingToken1 && usdPerToken1 / Number(formatUnits(currentRateToken1, 18));

  // use usd per underlying token if available, otherwise use usd per token
  const valueToken0 = shouldUseUnderlyingToken0 ? usdPerUnderlyingToken0 : usdPerToken0;
  const valueToken1 = shouldUseUnderlyingToken1 ? usdPerUnderlyingToken1 : usdPerToken1;

  // auto-fill usd per token input field values to start
  useEffect(() => {
    updateEclpParam({ usdPerTokenInput0: (valueToken0 ?? "").toString() });
  }, [valueToken0, updateEclpParam]);

  useEffect(() => {
    updateEclpParam({ usdPerTokenInput1: (valueToken1 ?? "").toString() });
  }, [valueToken1, updateEclpParam]);

  const poolSpotPrice =
    usdPerTokenInput0 && usdPerTokenInput1 ? Number(usdPerTokenInput0) / Number(usdPerTokenInput1) : null;

  return { poolSpotPrice, usdPerToken0, usdPerToken1 };
};
