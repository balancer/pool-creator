import { useEffect } from "react";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { sortTokenConfigs } from "~~/utils/helpers";

// Fetch token prices from API to auto-fill USD values for eclp params
export function useEclpPoolSpotPrice() {
  const { eclpParams, tokenConfigs, updateEclpParam } = usePoolCreationStore();
  const { isTokenOrderInverted } = eclpParams;
  const { hasEditedEclpTokenUsdValues } = useUserDataStore();

  const sortedTokens = sortTokenConfigs(tokenConfigs).map(token => ({
    address: token.address,
    symbol: token.tokenInfo?.symbol,
  }));
  if (isTokenOrderInverted) sortedTokens.reverse();

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
}
