import { sepolia } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import scaffoldConfig from "~~/scaffold.config";

export const useApiConfig = () => {
  const { targetNetwork } = useTargetNetwork();
  let currentChainId = targetNetwork.id;

  // If running locally, use the target fork chain id
  if (currentChainId === 31337) {
    currentChainId = scaffoldConfig.targetFork.id;
  }

  const chainName = CHAIN_NAMES[currentChainId];

  const url = currentChainId === sepolia.id ? "https://test-api-v3.balancer.fi/" : "https://api-v3.balancer.fi/";

  return { url, chainName };
};

export const CHAIN_NAMES: { [key: number]: string } = {
  1: "MAINNET",
  100: "GNOSIS",
  11155111: "SEPOLIA",
  42161: "ARBITRUM",
  8453: "BASE",
};
