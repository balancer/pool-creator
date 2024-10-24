/**
 * TODO: create stable pools with balancer standard token and aave boosted token
 * TODO: make flexible to work on different networks
 *
 * KEY: address of non yield bearing asset (from balancer token list)
 * VALUE: address of the boosted variant (from aave sepolia staging app)
 */
const standardToBoosted: Record<string, string> = {
  "0xB77EB1A70A96fDAAeB31DB1b42F2b8b5846b2613": "0x29598b72eb5CeBd806C5dCD549490FdA35B13cD8", // DAI -> aEthDAI
  // https://sepolia.etherscan.io/tx/0x2f128363a72738df413057b8f1e3af834d03edc4ec8af5b4fed453dc47ac2d08
  // https://sepolia.etherscan.io/tx/0xc946ff9e63caccbb85af692e14374cffbb7861737ce43dbd7fa145ebf03676d2
  "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A": "0x16dA4541aD1807f4443d92D26044C1147406EB80", // USDC -> aEthUSDC
  "0x6bF294B80C7d8Dc72DEE762af5d01260B756A051": "0xAF0F6e8b0Dc5c913bbF4d14c22B4E78Dd14310B6", // USDT -> aEthUSDT
  "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "0x5b071b590a59395fE4025A0Ccc1FcC931AAc1830", // wETH -> aEthWETH
};

export const useFetchBoostableTokens = () => {
  return { standardToBoosted };
};
