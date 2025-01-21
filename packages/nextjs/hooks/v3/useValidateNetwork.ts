import { gnosis, mainnet, sepolia, sonic } from "viem/chains";
import { useWalletClient } from "wagmi";

export const ALLOWED_NETWORKS = [sepolia.id, mainnet.id, gnosis.id, sonic.id] as const;

export function useValidateNetwork() {
  const { data: walletClient } = useWalletClient();
  const chainId = walletClient?.chain.id;
  const isWalletConnected = !!walletClient;
  const isWrongNetwork =
    isWalletConnected && chainId !== undefined && !ALLOWED_NETWORKS.includes(chainId as typeof sepolia.id);

  return { isWalletConnected, isWrongNetwork, chainId };
}
