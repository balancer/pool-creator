import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { usePoolCreationStore } from "~~/hooks/v3/";
import { pollSafeTxStatus } from "~~/utils/safe";

/**
 * Use init pool tx hash to move step progression forward
 */
export function useInitializePoolTxHash() {
  const { initPoolTx, updatePool, poolType, poolAddress, step } = usePoolCreationStore();
  const { wagmiHash, safeHash } = initPoolTx;

  const publicClient = usePublicClient();
  const isSafeWallet = useIsSafeWallet();
  const { sdk } = useSafeAppsSDK();

  return useQuery({
    queryKey: ["initPoolTx", wagmiHash, safeHash],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for init pool tx hash");
      if (poolType === undefined) throw new Error("Pool type is undefined");

      if (isSafeWallet && safeHash && !wagmiHash) {
        const wagmiHash = await pollSafeTxStatus(sdk, safeHash);
        updatePool({ createPoolTx: { safeHash, wagmiHash } });
        return null; // Trigger a re-query with the new wagmiHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        updatePool({ step: step + 1, hasBeenInitialized: true });
      } else {
        throw new Error("Init pool transaction reverted");
      }
    },
    enabled: Boolean(!poolAddress && (safeHash || wagmiHash)),
  });
}