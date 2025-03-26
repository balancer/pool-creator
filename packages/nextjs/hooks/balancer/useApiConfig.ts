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

  let chainName = targetNetwork.name.split(" ")[0].toUpperCase(); // "Arbitrum One" -> "ARBITRUM"
  console.log("chainName", chainName);
  if (chainName === "ETHEREUM") chainName = "MAINNET"; // viem calls it "ETHEREUM" but our API requires "MAINNET";

  const url = currentChainId === sepolia.id ? "https://test-api-v3.balancer.fi/" : "https://api-v3.balancer.fi/";

  return { url, chainName };
};
