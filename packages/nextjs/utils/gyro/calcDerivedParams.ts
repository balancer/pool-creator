import { DerivedEclpParams, EclpParams, Vector2 } from "@balancer/sdk";
import { Big } from "big.js";

export function calcDerivedParams(params: EclpParams): DerivedEclpParams {
  const D18 = 10n ** 18n; // 18 decimal precision is how params are stored
  const D38 = 10n ** 38n; // 38 decimal precision for derived param return values
  const D100 = 10n ** 100n; // 100 decimal precision for internal calculations

  let { alpha, beta, c, s, lambda } = params; // params start at 18

  // scale from 18 to 100
  c = (c * D100) / D18;
  s = (s * D100) / D18;
  lambda = (lambda * D100) / D18;
  alpha = (alpha * D100) / D18;
  beta = (beta * D100) / D18;

  const dSq = (c * c + s * s) / D100; // divide by D100 to keep at 100 decimal precision

  // const d = GyroPoolMath.sqrt(dSq, 5n); // sir isaac style throws error _sqrt FAILED
  const d = bigIntSqrt(dSq) * 10n ** 50n; // square root reduces precision by 50 decimal places?

  const dAlpha =
    D100 /
    bigIntSqrt(
      (((c * D100) / d + (alpha * s) / d) ** 2n * D100) / lambda ** 2n +
        ((alpha * c) / d - (s * D100) / d) ** 2n / D100,
    );

  const dBeta =
    D100 /
    bigIntSqrt(
      (((c * D100) / d + (beta * s) / d) ** 2n * D100) / lambda ** 2n + ((beta * c) / d - (s * D100) / d) ** 2n / D100,
    );

  const tauAlpha: Vector2 = {
    x: (((alpha * c) / D100 - s) * dAlpha) / 10n ** 112n,
    y: ((((c + (s * alpha) / D100) * dAlpha) / D100) * D100) / lambda / 10n ** 12n,
  };

  const tauBeta: Vector2 = {
    x: (((beta * c) / D100 - s) * dBeta) / 10n ** 112n,
    y: ((((c + (s * beta) / D100) * dBeta) / D100) * D100) / lambda / 10n ** 12n,
  };

  // Each multiplication must be scaled down by D100
  const w = (s * c * (tauBeta.y - tauAlpha.y)) / (D100 * D100);
  const z = (c * c * tauBeta.x + s * s * tauAlpha.x) / (D100 * D100);
  const u = (s * c * (tauBeta.x - tauAlpha.x)) / (D100 * D100) + 1n;
  const v = (s * s * tauBeta.y + c * c * tauAlpha.y) / (D100 * D100) + 1n;

  // all return values scaled to 38 decimal places
  return {
    tauAlpha,
    tauBeta,
    u,
    v,
    w,
    z,
    dSq: (dSq * D38) / D100,
  };
}

export function bigIntSqrt(val: bigint): bigint {
  return BigInt(new Big(val.toString()).sqrt().toFixed(0));
}
