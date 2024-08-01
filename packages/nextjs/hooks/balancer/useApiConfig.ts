import { sepolia } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export const useApiConfig = () => {
  const { targetNetwork } = useTargetNetwork();
  const currentChainId = targetNetwork.id;

  const chainIdToName: { [key: number]: string } = {
    1: "MAINNET",
    100: "GNOSIS",
    11155111: "SEPOLIA",
  };

  const chainName = chainIdToName[targetNetwork.id];

  let url;

  // Sepolia data only available on test-api-v3
  if (currentChainId === sepolia.id) {
    url = "https://test-api-v3.balancer.fi/";
  } else {
    url = "https://api-v3.balancer.fi/";
  }

  return { url, chainName };
};
