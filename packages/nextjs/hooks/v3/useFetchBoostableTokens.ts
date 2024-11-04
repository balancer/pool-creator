import { Address } from "viem";

export type BoostedTokenInfo = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
};

/**
 * @TODO change so this hook accepts underlying token address as arg and finds the boosted version using fetch to balancer api
 */

export const useFetchBoostableTokens = () => {
  return { standardToBoosted };
};

/**
 * KEY: address of non yield bearing asset (from balancer token list)
 * VALUE: address of the boosted variant (wrapped "static" version that vault supports)
 */
const standardToBoosted: Record<Address, BoostedTokenInfo> = {
  // dai-aave (faucet token) -> stataEthDAI
  "0xff34b3d4aee8ddcd6f9afffb6fe49bd371b8a357": {
    address: "0xDE46e43F46ff74A23a65EBb0580cbe3dFE684a17",
    name: "Static Aave Ethereum DAI",
    symbol: "stataEthDAI",
    decimals: 18,
  },
  // usdc-aave (faucet token) -> stataEthUSDC
  "0x94a9d9ac8a22534e3faca9f4e7f2e2cf85d5e4c8": {
    address: "0x8A88124522dbBF1E56352ba3DE1d9F78C143751e",
    name: "Static Aave Ethereum USDC",
    symbol: "stataEthUSDC",
    decimals: 6,
  },
  // usdt-aave (faucet token) -> stataEthUSDT
  "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0": {
    address: "0x978206fAe13faF5a8d293FB614326B237684B750",
    name: "Static Aave Ethereum USDT",
    symbol: "stataEthUSDT",
    decimals: 6, // beware cant read contract decimals for stataEthUSDT on etherscan?!?
  },
};
