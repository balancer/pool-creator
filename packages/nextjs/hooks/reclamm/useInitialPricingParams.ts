import { useEffect } from "react";
import { useSortedTokenConfigs } from "~~/hooks/balancer";
import { useTokenUsdValue } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

/**
 * 1. fetch usd per token A and B from API
 * 2. Divide B by A and save as initial target price
 * 3. Figure out how much higher and lower to set min and max price relative to target price
 */
export function useInitialPricingParams() {
  const sortedTokenConfigs = useSortedTokenConfigs();
  const { updateReClammParam, reClammParams } = usePoolCreationStore();

  const { initialTargetPrice, usdPerTokenInputA, usdPerTokenInputB } = reClammParams;

  const { tokenUsdValue: usdPerTokenA } = useTokenUsdValue(sortedTokenConfigs[0].address, "1");
  const { tokenUsdValue: usdPerTokenB } = useTokenUsdValue(sortedTokenConfigs[1].address, "1");

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
        initialTargetPrice: newInitialTargetPrice.toString(),
        initialMinPrice: (newInitialTargetPrice * 0.9).toString(),
        initialMaxPrice: (newInitialTargetPrice * 1.1).toString(),
      });
    }
  }, [updateReClammParam, usdPerTokenInputA, usdPerTokenInputB, initialTargetPrice]);
}
