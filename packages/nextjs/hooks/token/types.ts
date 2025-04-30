export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
  hasBoostedVariant?: boolean;
  underlyingTokenAddress: string | undefined;
  isBufferAllowed: boolean;
  priceRateProviderData: {
    address: string;
    summary: string;
    name: string;
    reviewed: boolean;
    warnings: string[];
    reviewFile: string;
  } | null;
};
