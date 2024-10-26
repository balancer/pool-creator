import { Address } from "viem";

/**
 * TODO: create stable pools with balancer standard token and aave boosted token
 * TODO: make flexible to work on different networks
 *
 * KEY: address of non yield bearing asset (from balancer token list)
 * VALUE: address of the boosted variant (from aave sepolia staging app)
 */
const standardToBoosted: Record<
  Address,
  { address: Address; name: string; symbol: string; decimals: number; pool: Address }
> = {
  // DAI -> aEthDAI
  // TODO: this pool was deployed on SDK version using deploy 9, need to update with a deploy 10 version
  // pool address: 0x64597A5F88D6dCBe14DA8f515B35a54394A9e12c
  // https://sepolia.etherscan.io/address/0x64597A5F88D6dCBe14DA8f515B35a54394A9e12c#readContract
  "0xB77EB1A70A96fDAAeB31DB1b42F2b8b5846b2613": {
    address: "0x29598b72eb5CeBd806C5dCD549490FdA35B13cD8",
    name: "Aave Ethereum DAI",
    symbol: "aEthDAI",
    decimals: 18,
    pool: "0xE29a3c870294258f41cEf92Eb466000C35eDbe9a", // DAI-aEthDAI
  },
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // USDC -> aEthUSDC
  "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A": {
    address: "0x16dA4541aD1807f4443d92D26044C1147406EB80",
    name: "Aave Ethereum USDC",
    symbol: "aEthUSDC",
    decimals: 6,
    pool: "0x863F66205a29f97079d409ba0B1523a26919dd46", // USDC-aEthUSDC
  },
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // USDT -> aEthUSDT
  // "0x6bF294B80C7d8Dc72DEE762af5d01260B756A051": {
  //   address: "0xAF0F6e8b0Dc5c913bbF4d14c22B4E78Dd14310B6",
  //   name: "Aave Ethereum USDT",
  //   symbol: "aEthUSDT",
  //   decimals: 18,
  // },
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  // wETH -> aEthWETH
  // "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": {
  //   address: "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830",
  //   name: "Aave Ethereum WETH",
  //   symbol: "aEthWETH",
  //   decimals: 18,
  // },
};

export const useFetchBoostableTokens = () => {
  return { standardToBoosted };
};
