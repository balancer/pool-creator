import { type Address } from "viem";

export type Token = {
  chainId: number;
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  hasBoostedVariant?: boolean;
  underlyingTokenAddress: Address | undefined;
  isBufferAllowed: boolean;
  priceRateProviderData: {
    address: Address;
    summary: string;
    name: string;
    reviewed: boolean;
    warnings: string[];
    reviewFile: string;
  } | null;
};
