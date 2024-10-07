import { Address } from "viem";

export type PoolType = "Weighted" | "Stable" | undefined;

export type TokenConfig = TokenInfo & {
  address: Address | undefined;
  rateProvider: Address;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: bigint;
};

export type TokenInfo = {
  symbol: string | undefined;
  logoURI: string | undefined;
};

export enum TokenType {
  STANDARD = 0,
  WITH_RATE = 1,
}
