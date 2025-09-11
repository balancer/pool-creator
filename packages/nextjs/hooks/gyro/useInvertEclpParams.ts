import { useCallback } from "react";
import { usePoolCreationStore } from "../v3";
import { formatUnits, parseUnits } from "viem";
import { formatEclpParamValues } from "~~/utils/gryo";

const D18 = 10n ** 18n;

export function useInvertEclpParams() {
  const { eclpParams, updateEclpParam, updatePool, tokenConfigs } = usePoolCreationStore();

  const invertEclpParams = useCallback(() => {
    const { alpha, beta, peakPrice, c, s, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

    const invertedAlpha = Number(formatUnits((D18 * D18) / parseUnits(alpha, 18), 18));
    const invertedBeta = Number(formatUnits((D18 * D18) / parseUnits(beta, 18), 18));
    const invertedPeakPrice = Number(formatUnits((D18 * D18) / parseUnits(peakPrice, 18), 18));

    const invertedParams = {
      alpha: formatEclpParamValues(invertedBeta), // flip alpha to inverted beta
      beta: formatEclpParamValues(invertedAlpha), // flip beta to inverted alpha
      peakPrice: formatEclpParamValues(invertedPeakPrice),
      c: s, // flip c to s
      s: c, // flip s to c
      usdPerTokenInput0: usdPerTokenInput1,
      usdPerTokenInput1: usdPerTokenInput0,
    };

    // Use a timeout to ensure this update happens after other effects
    setTimeout(() => {
      updateEclpParam(invertedParams);
      updatePool({ tokenConfigs: [...tokenConfigs].reverse() });
    }, 0);
  }, [eclpParams, updateEclpParam, updatePool, tokenConfigs]);

  return { invertEclpParams };
}
