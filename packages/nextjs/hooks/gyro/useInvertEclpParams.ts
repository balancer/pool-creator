import { usePoolCreationStore } from "~~/hooks/v3";
import { calculateRotationComponents, formatEclpParamValues } from "~~/utils/gryo";

/**
 * Inverts the eclp params by using the percentage differences from initial spot price
 * @returns {Function} invertEclpParams - A function that inverts the eclp params held in persisted state
 */
export function useInvertEclpParams() {
  const { eclpParams, updateEclpParam } = usePoolCreationStore();

  const invertEclpParams = () => {
    const { isTokenOrderInverted, usdValueToken0, usdValueToken1, alpha, beta, lambda, peakPrice } = eclpParams;

    const initialSpotPrice = Number(usdValueToken0) / Number(usdValueToken1);
    const invertedSpotPrice = Number(usdValueToken1) / Number(usdValueToken0);

    const initialAlpha = Number(alpha);
    const initialBeta = Number(beta);
    const initialAlphaPercentDiff = (initialSpotPrice - initialAlpha) / initialSpotPrice;
    const initialBetaPercentDiff = (initialBeta - initialSpotPrice) / initialSpotPrice;
    const alphaAdjustment = invertedSpotPrice * initialAlphaPercentDiff;
    const betaAdjustment = invertedSpotPrice * initialBetaPercentDiff;
    const invertedAlpha = formatEclpParamValues(invertedSpotPrice - alphaAdjustment);
    const invertedBeta = formatEclpParamValues(invertedSpotPrice + betaAdjustment);

    const initialPeakPrice = Number(peakPrice);
    const initialPeakPricePercentDiff = (initialPeakPrice - initialSpotPrice) / initialSpotPrice;
    const peakPriceAdjustmentFactor = 1 + initialPeakPricePercentDiff;
    const invertedPeakPrice = formatEclpParamValues(invertedSpotPrice * peakPriceAdjustmentFactor);
    const { c: invertedC, s: invertedS } = calculateRotationComponents(invertedPeakPrice); // use inverted peak price to calculate inverted c & s

    updateEclpParam({
      alpha: invertedAlpha,
      beta: invertedBeta,
      c: invertedC,
      s: invertedS,
      lambda, // Don't think lambda needs any modification for invert
      peakPrice: invertedPeakPrice,
      usdValueToken0: usdValueToken1,
      usdValueToken1: usdValueToken0,
      isTokenOrderInverted: !isTokenOrderInverted,
    });
  };

  return { invertEclpParams };
}
