import { Address } from "viem";

export type PoolType = "Weighted" | "Stable" | undefined;

export type TokenConfig = TokenDetails & {
  address: Address;
  rateProvider: Address;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight?: bigint;
};

export type TokenDetails = {
  symbol: string;
  decimals: number;
  logoURI: string;
};

export enum TokenType {
  STANDARD = 0,
  WITH_RATE = 1,
}
