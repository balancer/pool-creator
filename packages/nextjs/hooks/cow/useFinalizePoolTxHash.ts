import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

export function useFinalizePoolTxHash() {
  const isSafeWallet = useIsSafeWallet();
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const { finalizePoolTx } = poolCreation || {};
  const { safeHash, wagmiHash, isSuccess } = finalizePoolTx || {};

  return useQuery({
    queryKey: ["finalizePoolTxHash", safeHash, wagmiHash, isSuccess],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");

      // If safe wallet, poll for safe tx status to update createPoolTxHash
      if (isSafeWallet && safeHash && !wagmiHash) {
        const hash = await pollSafeTxStatus(sdk, safeHash);
        updatePoolCreation({ finalizePoolTx: { safeHash, wagmiHash: hash, isSuccess: false } });
        return null; // Trigger a re-query with the new createPoolTxHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        if (!poolCreation?.step) throw new Error("Missing pool creation step");
        updatePoolCreation({ finalizePoolTx: { safeHash, wagmiHash, isSuccess: true }, step: poolCreation.step + 1 });
        return { isSuccess: true };
      } else {
        throw new Error("Create pool transaction reverted");
      }
    },
    enabled: Boolean(!isSuccess && (safeHash || wagmiHash)),
  });
}
