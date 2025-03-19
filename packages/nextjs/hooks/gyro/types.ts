export type EclpParams = {
  alpha: string;
  beta: string;
  c: string;
  s: string;
  lambda: string;
};

export type Vector2 = {
  x: bigint;
  y: bigint;
};

export type DerivedEclpParams = {
  tauAlpha: Vector2;
  tauBeta: Vector2;
  u: bigint;
  v: bigint;
  w: bigint;
  z: bigint;
  dSq: bigint;
};
