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
  const { initPoolTx, updatePool, poolType, step } = usePoolCreationStore();
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
        updatePool({ initPoolTx: { safeHash, wagmiHash, isSuccess: false } });
        return null; // Trigger a re-query with the new wagmiHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        updatePool({ step: step + 1, initPoolTx: { safeHash, wagmiHash, isSuccess: true } });
        return { isSuccess: true };
      } else {
        // other option is tx reverts at which point we want to clear state to attempt new tx to be sent
        updatePool({ initPoolTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false } });
        throw new Error("Init pool transaction reverted");
      }
    },
    enabled: Boolean(!initPoolTx.isSuccess && (safeHash || wagmiHash)),
  });
}
