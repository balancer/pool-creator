import { hyperEVM, plasma } from "./constants";
import * as chains from "viem/chains";

export const supportedNetworks = {
  balancerV3: [
    chains.mainnet,
    chains.arbitrum,
    chains.base,
    chains.gnosis,
    chains.avalanche,
    hyperEVM,
    plasma,
    chains.sepolia,
  ],
  beets: [chains.sonic, chains.optimism],
  cowAmm: [chains.mainnet, chains.arbitrum, chains.base, chains.gnosis, chains.sepolia],
};
