// import { hyperEVM } from "../constants";
import { hyperEVM } from "../constants";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";

type ChainAttributes = {
  // color | [lightThemeColor, darkThemeColor]
  color: string | [string, string];
  // Used to fetch price by providing mainnet token address
  // for networks having native currency other than ETH
  nativeCurrencyTokenAddress?: string;
};

export type ChainWithAttributes = chains.Chain & Partial<ChainAttributes>;

// Mapping of chainId to RPC chain name an format followed by alchemy
export const RPC_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "eth-mainnet",
  [chains.goerli.id]: "eth-goerli",
  [chains.sepolia.id]: "eth-sepolia",
  [chains.optimism.id]: "opt-mainnet",
  [chains.optimismGoerli.id]: "opt-goerli",
  [chains.optimismSepolia.id]: "opt-sepolia",
  [chains.arbitrum.id]: "arb-mainnet",
  [chains.arbitrumGoerli.id]: "arb-goerli",
  [chains.arbitrumSepolia.id]: "arb-sepolia",
  [chains.polygon.id]: "polygon-mainnet",
  [chains.polygonMumbai.id]: "polygon-mumbai",
  [chains.polygonAmoy.id]: "polygon-amoy",
  [chains.astar.id]: "astar-mainnet",
  [chains.polygonZkEvm.id]: "polygonzkevm-mainnet",
  [chains.polygonZkEvmTestnet.id]: "polygonzkevm-testnet",
  [chains.base.id]: "base-mainnet",
  [chains.baseGoerli.id]: "base-goerli",
  [chains.baseSepolia.id]: "base-sepolia",
  [chains.avalanche.id]: "avax-mainnet",
};

export const getAlchemyHttpUrl = (chainId: number) => {
  return scaffoldConfig.alchemyApiKey && RPC_CHAIN_NAMES[chainId]
    ? `https://${RPC_CHAIN_NAMES[chainId]}.g.alchemy.com/v2/${scaffoldConfig.alchemyApiKey}`
    : undefined;
};

export const INFURA_CHAIN_NAMES: Record<number, string> = {
  [chains.mainnet.id]: "mainnet",
  [chains.sepolia.id]: "sepolia",
  [chains.arbitrum.id]: "arbitrum-mainnet",
  [chains.avalanche.id]: "avalanche-mainnet",
  [chains.base.id]: "base-mainnet",
  [chains.sonic.id]: "sonic-mainnet",
  [chains.optimism.id]: "optimism-mainnet",
};

export const getInfuraHttpUrl = (chainId: number) => {
  return scaffoldConfig.infuraApiKey && INFURA_CHAIN_NAMES[chainId]
    ? `https://${INFURA_CHAIN_NAMES[chainId]}.infura.io/v3/${scaffoldConfig.infuraApiKey}`
    : undefined;
};

export const DRPC_CHAIN_NAMES: Record<number, string> = {
  [chains.sonic.id]: "sonic",
  [chains.arbitrum.id]: "arbitrum",
  [chains.base.id]: "base",
  [chains.mainnet.id]: "ethereum",
  [chains.avalanche.id]: "avalanche",
  [chains.gnosis.id]: "gnosis",
  [chains.sepolia.id]: "sepolia",
  [chains.optimism.id]: "optimism",
  // [hyperEVM.id]: "hyperliquid",
};

export const getDrpcHttpUrl = (chainId: number) => {
  return scaffoldConfig.drpcApiKey && DRPC_CHAIN_NAMES[chainId]
    ? `https://lb.drpc.org/ogrpc?network=${DRPC_CHAIN_NAMES[chainId]}&dkey=${scaffoldConfig.drpcApiKey}`
    : undefined;
};

export const RPC_FALLBACKS: Record<number, string> = {
  [chains.mainnet.id]: "https://mainnet.gateway.tenderly.co",
  [chains.arbitrum.id]: "https://arbitrum.llamarpc.com",
  [chains.gnosis.id]: "https://gnosis.drpc.org",
  [chains.sepolia.id]: "https://sepolia.gateway.tenderly.co",
  [chains.base.id]: "https://base.llamarpc.com",
  [chains.avalanche.id]: "https://avalanche.gateway.tenderly.co/",
  [chains.optimism.id]: "https://optimism.gateway.tenderly.co/",
  [chains.sonic.id]: "https://sonic.drpc.org",
  // [hyperEVM.id]: "https://rpc.hyperliquid.xyz/evm",
};

export const getRpcFallbackUrl = (chainId: number) => {
  return RPC_FALLBACKS[chainId];
};

export const NETWORKS_EXTRA_DATA: Record<string, ChainAttributes> = {
  [chains.hardhat.id]: {
    color: "#b8af0c",
  },
  [chains.mainnet.id]: {
    color: "#ff8b9e",
  },
  [chains.sepolia.id]: {
    color: ["#5f4bb6", "#87ff65"],
  },
  [chains.gnosis.id]: {
    color: "#48a9a6",
  },
  [chains.polygon.id]: {
    color: "#2bbdf7",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.polygonMumbai.id]: {
    color: "#92D9FA",
    nativeCurrencyTokenAddress: "0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0",
  },
  [chains.optimismSepolia.id]: {
    color: "#f01a37",
  },
  [chains.optimism.id]: {
    color: "#f01a37",
  },
  [chains.arbitrumSepolia.id]: {
    color: "#28a0f0",
  },
  [chains.arbitrum.id]: {
    color: "#28a0f0",
  },
  [chains.fantom.id]: {
    color: "#1969ff",
  },
  [chains.fantomTestnet.id]: {
    color: "#1969ff",
  },
  [chains.scrollSepolia.id]: {
    color: "#fbebd4",
  },
  [chains.avalanche.id]: {
    color: "#92D9FA",
  },
};

/**
 * Gives the block explorer transaction URL, returns empty string if the network is a local chain
 */
export function getBlockExplorerTxLink(chainId: number | undefined, txnHash: string | undefined) {
  if (!chainId || !txnHash) return undefined;

  const chainNames = Object.keys(chains);

  const targetChainArr = chainNames.filter(chainName => {
    const wagmiChain = chains[chainName as keyof typeof chains];
    return wagmiChain.id === chainId;
  });

  if (targetChainArr.length === 0) {
    return "";
  }

  const targetChain = targetChainArr[0] as keyof typeof chains;
  const blockExplorerTxURL = chains[targetChain]?.blockExplorers?.default?.url;

  if (!blockExplorerTxURL) {
    return "";
  }

  if (chainId === hyperEVM.id) {
    return `https://hyperevmscan.io/tx/${txnHash}`;
  }

  return `${blockExplorerTxURL}/tx/${txnHash}`;
}

/**
 * Gives the block explorer URL for a given address.
 * Defaults to Etherscan if no (wagmi) block explorer is configured for the network.
 */
export function getBlockExplorerAddressLink(network: chains.Chain, address: string) {
  const blockExplorerBaseURL = network.blockExplorers?.default?.url;
  if (network.id === chains.hardhat.id) {
    return `/blockexplorer/address/${address}`;
  }

  if (!blockExplorerBaseURL) {
    return `https://etherscan.io/address/${address}`;
  }

  return `${blockExplorerBaseURL}/address/${address}`;
}

/**
 * @returns targetNetworks array containing networks configured in scaffold.config including extra network metadata
 */
export function getTargetNetworks(): ChainWithAttributes[] {
  return scaffoldConfig.targetNetworks.map(targetNetwork => ({
    ...targetNetwork,
    ...NETWORKS_EXTRA_DATA[targetNetwork.id],
  }));
}
