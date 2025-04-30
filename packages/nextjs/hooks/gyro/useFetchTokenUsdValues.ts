import { useEffect } from "react";
import { formatUnits } from "viem";
import { useEclpTokenOrder } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

export function useFetchTokenUsdValues() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { hasFetchedUsdValueToken0, hasFetchedUsdValueToken1 } = eclpParams;
  const sortedTokens = useEclpTokenOrder();

  // Fetch token prices from API to auto-fill USD values for tokens
  const { tokenUsdValue: usdValueToken0 } = useTokenUsdValue(sortedTokens[0].address, "1");
  const { tokenUsdValue: usdValueToken1 } = useTokenUsdValue(sortedTokens[1].address, "1");

  useEffect(() => {
    // Update state to include underlying token values if currentRate exists (meaning is erc4626 token)
    if (!hasFetchedUsdValueToken0 && usdValueToken0) {
      const currentRate = sortedTokens[0].currentRate;
      const underlyingUsdValueToken0 = currentRate ? usdValueToken0 / Number(formatUnits(currentRate, 18)) : undefined;
      const usdValueTokenInput0 = underlyingUsdValueToken0 ? underlyingUsdValueToken0 : usdValueToken0;

      updateEclpParam({
        usdValueTokenInput0: usdValueTokenInput0.toString(), // need string because this state is for input field
        usdValueToken0,
        underlyingUsdValueToken0,
        hasFetchedUsdValueToken0: true,
      });
    }
    if (!hasFetchedUsdValueToken1 && usdValueToken1) {
      const currentRate = sortedTokens[1].currentRate;
      const underlyingUsdValueToken1 = currentRate ? usdValueToken1 / Number(formatUnits(currentRate, 18)) : undefined;
      const usdValueTokenInput1 = underlyingUsdValueToken1 ? underlyingUsdValueToken1 : usdValueToken1;

      updateEclpParam({
        usdValueTokenInput1: usdValueTokenInput1.toString(), // need string because this state is for input field
        usdValueToken1,
        underlyingUsdValueToken1,
        hasFetchedUsdValueToken1: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usdValueToken0, usdValueToken1, updateEclpParam, hasFetchedUsdValueToken0, hasFetchedUsdValueToken1]);
}
