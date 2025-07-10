import { defineChain } from "viem";

export const hyperEVM = /*#__PURE__*/ defineChain({
  id: 999,
  name: "HyperEVM",
  nativeCurrency: {
    name: "HYPE gas token",
    symbol: "HYPE",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.hyperliquid.xyz/evm"],
    },
  },
  blockExplorers: {
    default: {
      name: "HyperEVM Mainnet explorer",
      url: "https://hyperevmscan.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 13051,
    },
  },
  testnet: false,
});
