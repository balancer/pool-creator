import { useEclpSpotPrice } from "./useEclpSpotPrice";

type UseEclpInitAmountsRatio = {
  alpha: number;
  beta: number;
  c: number;
  s: number;
  lambda: number;
  rateA: number;
  rateB: number;
};

/**
 * helper function for calculation of proper token amounts for ECLP initialization
 * logic provided by @joaobrunoah
 */
export function useEclpInitAmountsRatio({ alpha, beta, c, s, lambda, rateA, rateB }: UseEclpInitAmountsRatio) {
  const { poolSpotPrice: spotPriceWithoutRate } = useEclpSpotPrice();
  if (!spotPriceWithoutRate || !alpha || !beta || !c || !s || !lambda || !rateA || !rateB) return undefined;

  const rHint = 1000;
  const tauAlpha = getTau(alpha, c, s, lambda);
  const tauBeta = getTau(beta, c, s, lambda);
  const tauSpotPrice = getTau(spotPriceWithoutRate, c, s, lambda);

  const amountTokenA =
    rateA * rHint * (c * lambda * tauBeta[0] + s * tauBeta[1]) - (c * lambda * tauSpotPrice[0] + s * tauSpotPrice[1]);
  const amountTokenB =
    rateB * rHint * (-s * lambda * tauAlpha[0] + c * tauAlpha[1]) -
    (-s * lambda * tauSpotPrice[0] + c * tauSpotPrice[1]);
  const ratio = amountTokenA / amountTokenB;

  return ratio;
}

function getTau(price: number, c: number, s: number, lambda: number) {
  return [price * c - s, (c + s * price) / lambda];
}
