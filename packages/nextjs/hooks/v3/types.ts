import { TokenType } from "@balancer/sdk";
import { Address } from "viem";
import { type Token } from "~~/hooks/token";

export type TokenConfig = {
  address: Address;
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
