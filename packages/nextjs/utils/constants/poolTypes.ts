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
  [PoolType.Stable]: {
    label: "Stable",
    maxTokens: 5,
    description:
      "Stable pools are perfect for tightly correlated assets like stablecoins, ensuring seamless trading with minimal slippage",
  },
  [PoolType.StableSurge]: {
    label: "Stable Surge",
    maxTokens: 5,
    description: "A stable pool that uses the stable surge hook deployed by Balancer's official stable surge factory",
  },
  [PoolType.Weighted]: {
    label: "Weighted",
    maxTokens: 8,
    description:
      "Weighted pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
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
    description:
      "A concentrated liquidity pool that automates adjustments to the range of liquidity provided as price moves",
  },
};
