import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

export function useCreatePoolTxHash() {
  const isSafeWallet = useIsSafeWallet();
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const { createPoolTx, poolAddress } = poolCreation || {};
  const { safeHash, wagmiHash, isSuccess } = createPoolTx || {};

  return useQuery({
    queryKey: ["cowPoolAddress", safeHash, wagmiHash, isSuccess],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");

      // If safe wallet, poll for safe tx status to update createPoolTxHash
      if (isSafeWallet && safeHash && !wagmiHash) {
        const hash = await pollSafeTxStatus(sdk, safeHash);
        updatePoolCreation({ createPoolTx: { safeHash, wagmiHash: hash, isSuccess: false } });
        return null; // Trigger a re-query with the new createPoolTxHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        const logs = parseEventLogs({
          abi: abis.CoW.BCoWFactory,
          logs: txReceipt.logs,
        });

        const newPoolAddress = (logs[0].args as { caller: string; bPool: string }).bPool;
        if (!newPoolAddress) throw new Error("No new pool address from pool creation tx receipt");

        updatePoolCreation({
          createPoolTx: { safeHash, wagmiHash, isSuccess: true },
          poolAddress: newPoolAddress,
          step: 2,
        });
        return newPoolAddress;
      } else {
        throw new Error("Create pool transaction reverted");
      }
    },
    enabled: Boolean(!poolAddress && (safeHash || wagmiHash)),
  });
}
