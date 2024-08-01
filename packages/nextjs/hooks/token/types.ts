export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export type TokenPrice = {
  chain: string;
  adddress: string;
  price: number;
  updatedAt: number;
};
