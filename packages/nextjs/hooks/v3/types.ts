import { Address } from "viem";
import { type Token } from "~~/hooks/token";

export type TokenConfig = {
  address: Address | undefined;
  rateProvider: Address;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: bigint;
  tokenInfo: Token | null;
};

export type TokenInfo = {
  symbol: string | undefined;
  logoURI: string | undefined;
};

export enum TokenType {
  STANDARD = 0,
  WITH_RATE = 1,
}
