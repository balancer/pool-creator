import { defineChain } from "viem";

/**
 * https://github.com/wevm/viem/blob/main/src/chains/definitions/sonic.ts
 */
export const sonic = /*#__PURE__*/ defineChain({
  id: 146,
  name: "Sonic",
  nativeCurrency: {
    decimals: 18,
    name: "Sonic",
    symbol: "S",
  },
  rpcUrls: {
    default: { http: ["https://rpc.soniclabs.com"] },
  },
  blockExplorers: {
    default: {
      name: "Sonic Explorer",
      url: "https://sonicscan.org",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 60,
    },
  },
  testnet: false,
});
