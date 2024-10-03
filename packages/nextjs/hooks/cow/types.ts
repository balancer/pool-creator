import { type Address } from "viem";

export type BCowPool = {
  address: Address;
  isFinalized: boolean;
  numTokens: bigint;
  currentTokens: Address[];
  swapFee: bigint;
  MAX_FEE: bigint;
};

export type ExistingPool = {
  chain: "string";
  id: Address;
  address: Address;
  type: "string";
  allTokens: {
    address: Address;
    weight: string;
  }[];
  dynamicData: {
    swapFee: string;
  };
};
