type params = {
  alpha: number;
  beta: number;
  c: number;
  s: number;
  lambda: number;
  rateA: number;
  rateB: number;
  spotPriceWithoutRate: number;
};

export function getEclpInitAmountsRatio({ alpha, beta, c, s, lambda, rateA, rateB, spotPriceWithoutRate }: params) {
  if (!spotPriceWithoutRate || !alpha || !beta || !c || !s || !lambda || !rateA || !rateB) return undefined;

  const rHint = 1000;
  const tauAlpha = getTau(alpha, c, s, lambda);
  const tauBeta = getTau(beta, c, s, lambda);
  const tauSpotPrice = getTau(spotPriceWithoutRate, c, s, lambda);

  const amountTokenA =
    rateA * rHint * (c * lambda * tauBeta[0] + s * tauBeta[1] - (c * lambda * tauSpotPrice[0] + s * tauSpotPrice[1]));
  const amountTokenB =
    rateB *
    rHint *
    (-s * lambda * tauAlpha[0] + c * tauAlpha[1] - (-s * lambda * tauSpotPrice[0] + c * tauSpotPrice[1]));
  const ratio = amountTokenA / amountTokenB;

  return ratio;
}

function getTau(price: number, c: number, s: number, lambda: number) {
  const dSq = c * c + s * s;
  const d = Math.sqrt(dSq);
  const dPrice =
    1 / Math.sqrt(Math.pow(c / d + (price * s) / d, 2) / (lambda * lambda) + Math.pow((price * c) / d - s / d, 2));
  return [(price * c - s) * dPrice, ((c + s * price) * dPrice) / lambda];
}
