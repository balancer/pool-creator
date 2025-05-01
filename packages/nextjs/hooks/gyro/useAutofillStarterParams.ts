import { useEffect } from "react";
import { useEclpSpotPrice } from "./";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { calculateRotationComponents, formatEclpParamValues } from "~~/utils/gryo";

export function useAutofillStarterParams() {
  const { updateEclpParam, eclpParams } = usePoolCreationStore();
  const { hasEditedEclpParams } = useUserDataStore();
  const { poolSpotPrice } = useEclpSpotPrice();

  const { lambda } = eclpParams;
  // Use pool spot price to calculate starting params for eclp curve
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
          lambda: lambda ? lambda : "100", // TODO: formula for lambda with consistent curve? maybe something logarithmic?
          peakPrice: formatEclpParamValues(poolSpotPrice),
        });
      }
    } else {
      // without pool spot price, can't calculate "starter" rotation component values
      updateEclpParam({ alpha: "", beta: "", c: "", s: "", peakPrice: "", lambda: "" });
    }
  }, [poolSpotPrice, updateEclpParam, hasEditedEclpParams, lambda]);
}
