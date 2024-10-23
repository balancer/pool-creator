/**
 * TODO: make flexible to work on different networks
 * key: token address of non yield bearing asset that has a boosted variant
 * value: token symbol of the boosted variant, TODO: replace with needed info about boosted variant
 */
const boostableTokenMap: Record<string, string> = {
  "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A": "aUSDC",
  "0x6bF294B80C7d8Dc72DEE762af5d01260B756A051": "aUSDT",
  "0xB77EB1A70A96fDAAeB31DB1b42F2b8b5846b2613": "aDAI",
  "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14": "awETH",
};

export const useFetchBoostableTokens = () => {
  return { boostableTokenMap };
};
