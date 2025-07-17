import { useEffect } from "react";
import { formatUnits } from "viem";
import { useTokenUsdValue } from "~~/hooks/token";
import { useFetchTokenRate, usePoolCreationStore } from "~~/hooks/v3";
import { useUserDataStore } from "~~/hooks/v3";
import { fNumCustom } from "~~/utils/numbers";

/**
 * 1. fetch usd per token A and B from API
 * 2. Divide B by A and save as initial target price
 * 3. Figure out how much higher and lower to set min and max price relative to target price
 */
export function useInitialPricingParams() {
  const { updateReClammParam, reClammParams, tokenConfigs } = usePoolCreationStore();
  const { hasEditedReclammParams } = useUserDataStore();
  const { initialTargetPrice, usdPerTokenInputA, usdPerTokenInputB } = reClammParams;

  console.log("tokenConfigs", tokenConfigs);

  const { tokenUsdValue: usdPerTokenA } = useTokenUsdValue(tokenConfigs[0].address, "1");
  const { tokenUsdValue: usdPerTokenB } = useTokenUsdValue(tokenConfigs[1].address, "1");

  const { data: currentRateTokenA } = useFetchTokenRate(tokenConfigs[0].rateProvider);
  const { data: currentRateTokenB } = useFetchTokenRate(tokenConfigs[1].rateProvider);

  useEffect(() => {
    if (currentRateTokenA) {
      updateReClammParam({ tokenAPriceIncludesRate: true });
    }
    if (currentRateTokenB) {
      updateReClammParam({ tokenBPriceIncludesRate: true });
    }
  }, [currentRateTokenA, currentRateTokenB, updateReClammParam]);

  const valueTokenA = usdPerTokenInputA ? Number(usdPerTokenInputA) : usdPerTokenA ? usdPerTokenA : null;
  const valueTokenB = usdPerTokenInputB ? Number(usdPerTokenInputB) : usdPerTokenB ? usdPerTokenB : null;

  const adjustedUsdPerTokenA =
    currentRateTokenA && valueTokenA ? valueTokenA / Number(formatUnits(currentRateTokenA, 18)) : valueTokenA;
  const adjustedUsdPerTokenB =
    currentRateTokenB && valueTokenB ? valueTokenB / Number(formatUnits(currentRateTokenB, 18)) : valueTokenB;

  // update usd per token inputs if API data available and user has not already set them
  useEffect(() => {
    if (adjustedUsdPerTokenA && !usdPerTokenInputA) {
      updateReClammParam({ usdPerTokenInputA: adjustedUsdPerTokenA.toString() });
    }
    if (adjustedUsdPerTokenB && !usdPerTokenInputB) {
      updateReClammParam({ usdPerTokenInputB: adjustedUsdPerTokenB.toString() });
    }
  }, [adjustedUsdPerTokenA, adjustedUsdPerTokenB, usdPerTokenInputA, usdPerTokenInputB, updateReClammParam]);

  // update initial price params if user has not dirtied them
  useEffect(() => {
    if (!hasEditedReclammParams && Number(usdPerTokenInputA) && Number(usdPerTokenInputB)) {
      const newInitialTargetPrice = Number(usdPerTokenInputA) / Number(usdPerTokenInputB);

      updateReClammParam({
        initialTargetPrice: fNumCustom(newInitialTargetPrice, "0.[00000]"),
        initialMinPrice: fNumCustom(newInitialTargetPrice * 0.9, "0.[00000]"),
        initialMaxPrice: fNumCustom(newInitialTargetPrice * 1.1, "0.[00000]"),
      });
    }
  }, [updateReClammParam, usdPerTokenInputA, usdPerTokenInputB, initialTargetPrice, hasEditedReclammParams]);
}
