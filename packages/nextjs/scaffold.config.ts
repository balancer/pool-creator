import * as chains from "viem/chains";
import { sonic } from "~~/utils/customChains";

export type ScaffoldConfig = {
  targetNetworks: readonly chains.Chain[];
  targetFork: chains.Chain;
  pollingInterval: number;
  alchemyApiKey: string;
  infuraApiKey: string;
  drpcApiKey: string;
  walletConnectProjectId: string;
  onlyLocalBurnerWallet: boolean;
};

const scaffoldConfig = {
  // The networks on which your DApp is live
  targetNetworks: [
    chains.sepolia,
    chains.mainnet,
    chains.gnosis,
    chains.arbitrum,
    chains.base,
    chains.avalanche,
    sonic,
  ],

  // If using chains.foundry as your targetNetwork, you must specify a network to fork
  targetFork: chains.sepolia,

  // The interval at which your front-end polls the RPC servers for new data
  // it has no effect if you only target the local network (default is 4000)
  pollingInterval: 30000,

  // You can get your own at https://dashboard.alchemyapi.io
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  alchemyApiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY || "",
  infuraApiKey: process.env.NEXT_PUBLIC_INFURA_API_KEY || "",
  drpcApiKey: process.env.NEXT_PUBLIC_DRPC_API_KEY || "",

  // This is ours WalletConnect's default project ID.
  // You can get your own at https://cloud.walletconnect.com
  // It's recommended to store it in an env variable:
  // .env.local for local testing, and in the Vercel/system env config for live apps.
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "3a8170812b534d0ff9d794f19a901d64",

  // Only show the Burner Wallet when running on hardhat network
  onlyLocalBurnerWallet: true,
} as const satisfies ScaffoldConfig;

export default scaffoldConfig;
