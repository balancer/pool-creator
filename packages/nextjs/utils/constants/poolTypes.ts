import { PoolType } from "@balancer/sdk";

export type SupportedPoolTypes =
  | PoolType.Stable
  | PoolType.Weighted
  | PoolType.StableSurge
  | PoolType.GyroE
  | PoolType.ReClamm;

export type PoolTypeDetails = {
  label: string;
  description: string;
  maxTokens: number;
};

export const poolTypeMap: Record<SupportedPoolTypes, PoolTypeDetails> = {
  [PoolType.Weighted]: {
    label: "Weighted",
    maxTokens: 8,
    description:
      "Highly configurable and versatile, Weighted Pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
  },
  [PoolType.Stable]: {
    label: "Stable",
    maxTokens: 4,
    description:
      "Engineered for assets that trade near parity, Stable Pools are perfect for tightly correlated assets like Stablecoins, ensuring seamless trading with minimal slippage",
  },
  [PoolType.StableSurge]: {
    label: "Stable Surge",
    maxTokens: 4,
    description:
      "A Balancer core stable pool that uses a stable surge hook deployed by the official stable surge factory",
  },
  [PoolType.GyroE]: {
    label: "Gyro Elliptic CLP",
    maxTokens: 2,
    description:
      "Gyro's elliptic concentrated liquidity pools concentrate liquidity within price bounds with the flexibility to asymmetrically focus liquidity",
  },
  [PoolType.ReClamm]: {
    label: "Readjusting CLAMM",
    maxTokens: 2,
    description: "A concentrated liquidity pool that adjusts the range of liquidity provided as price moves",
  },
};
