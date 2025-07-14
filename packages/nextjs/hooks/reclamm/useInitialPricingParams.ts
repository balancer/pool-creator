import { useEffect } from "react";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";
import { fNumCustom } from "~~/utils/numbers";

/**
 * 1. fetch usd per token A and B from API
 * 2. Divide B by A and save as initial target price
 * 3. Figure out how much higher and lower to set min and max price relative to target price
 */
export function useInitialPricingParams() {
  const { updateReClammParam, reClammParams, tokenConfigs } = usePoolCreationStore();

  const { initialTargetPrice, usdPerTokenInputA, usdPerTokenInputB } = reClammParams;

  const { tokenUsdValue: usdPerTokenA } = useTokenUsdValue(tokenConfigs[0].address, "1");
  const { tokenUsdValue: usdPerTokenB } = useTokenUsdValue(tokenConfigs[1].address, "1");

  // update usd per token inputs if API data available and user has not already set them
  useEffect(() => {
    if (usdPerTokenA && !usdPerTokenInputA) {
      updateReClammParam({ usdPerTokenInputA: usdPerTokenA.toString() });
    }
    if (usdPerTokenB && !usdPerTokenInputB) {
      updateReClammParam({ usdPerTokenInputB: usdPerTokenB.toString() });
    }
  }, [usdPerTokenA, usdPerTokenB, usdPerTokenInputA, usdPerTokenInputB, updateReClammParam]);

  // update initial target price if user has not already set it
  useEffect(() => {
    if (!initialTargetPrice && Number(usdPerTokenInputA) && Number(usdPerTokenInputB)) {
      const newInitialTargetPrice = Number(usdPerTokenInputA) / Number(usdPerTokenInputB);

      updateReClammParam({
        initialTargetPrice: fNumCustom(newInitialTargetPrice, "0.[00000]"),
        initialMinPrice: fNumCustom(newInitialTargetPrice * 0.9, "0.[00000]"),
        initialMaxPrice: fNumCustom(newInitialTargetPrice * 1.1, "0.[00000]"),
      });
    }
  }, [updateReClammParam, usdPerTokenInputA, usdPerTokenInputB, initialTargetPrice]);
}
