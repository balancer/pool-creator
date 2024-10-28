import { Address } from "viem";

/**
 * KEY: address of non yield bearing asset (from balancer token list)
 * VALUE: address of the boosted variant (wrapped "static" version that vault supports)
 */
const standardToBoosted: Record<Address, { address: Address; name: string; symbol: string; decimals: number }> = {
  // DAI -> stataEthDAI
  "0xB77EB1A70A96fDAAeB31DB1b42F2b8b5846b2613": {
    address: "0xDE46e43F46ff74A23a65EBb0580cbe3dFE684a17",
    name: "Static Aave Ethereum DAI",
    symbol: "stataEthDAI",
    decimals: 18,
  },
  // USDC -> stataEthUSDC
  "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A": {
    address: "0x8A88124522dbBF1E56352ba3DE1d9F78C143751e",
    name: "Static Aave Ethereum USDC",
    symbol: "stataEthUSDC",
    decimals: 6,
  },
};

export const useFetchBoostableTokens = () => {
  return { standardToBoosted };
};
