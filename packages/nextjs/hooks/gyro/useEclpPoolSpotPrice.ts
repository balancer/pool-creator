import { useEffect } from "react";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function useEclpPoolSpotPrice() {
  const { eclpParams, tokenConfigs, updateEclpParam } = usePoolCreationStore();
  const { isTokenOrderInverted } = eclpParams;
  const { hasEditedEclpTokenUsdValues } = useUserDataStore();

  const sortedTokens = tokenConfigs
    .map(token => ({ address: token.address, symbol: token.tokenInfo?.symbol }))
    .sort((a, b) => a.address.localeCompare(b.address));

  if (isTokenOrderInverted) sortedTokens.reverse();

  const { tokenUsdValue: usdValueFromApiToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdValueFromApiToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  useEffect(() => {
    if (!hasEditedEclpTokenUsdValues && usdValueFromApiToken0 && usdValueFromApiToken1) {
      updateEclpParam({
        usdValueToken0: usdValueFromApiToken0.toString(),
        usdValueToken1: usdValueFromApiToken1.toString(),
        poolSpotPrice: Number(usdValueFromApiToken0) / Number(usdValueFromApiToken1),
      });
    }
  }, [usdValueFromApiToken0, usdValueFromApiToken1, updateEclpParam, hasEditedEclpTokenUsdValues]);
}
