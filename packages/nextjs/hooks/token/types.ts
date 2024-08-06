export type Token = {
  chainId?: number;
  address?: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  logoURI?: string;
};

export type TokenPrice = {
  chain: string;
  address: string;
  price: number;
  updatedAt: number;
};
