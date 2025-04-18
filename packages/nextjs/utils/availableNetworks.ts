import { sonic } from "./customChains";
import * as chains from "viem/chains";

export const availableNetworks = {
  balancerV3: [chains.mainnet, chains.arbitrum, chains.base, chains.gnosis, chains.avalanche, chains.sepolia],
  beets: [sonic, chains.optimism],
  cowAmm: [chains.mainnet, chains.arbitrum, chains.base, chains.gnosis, chains.sepolia],
};
