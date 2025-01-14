import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { poolFactoryAbi, usePoolCreationStore } from "~~/hooks/v3/";
import { pollSafeTxStatus } from "~~/utils/safe";

/**
 * Use create pool tx hash to fetch pool address and save to store
 */
export function useCreatePoolTxHash() {
  const { createPoolTx, updatePool, poolType, poolAddress } = usePoolCreationStore();
  const { wagmiHash, safeHash } = createPoolTx;

  const publicClient = usePublicClient();
  const isSafeWallet = useIsSafeWallet();
  const { sdk } = useSafeAppsSDK();

  return useQuery({
    queryKey: ["v3PoolAddress", wagmiHash, safeHash],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");
      if (poolType === undefined) throw new Error("Pool type is undefined");

      if (isSafeWallet && safeHash && !wagmiHash) {
        const wagmiHash = await pollSafeTxStatus(sdk, safeHash);
        updatePool({ createPoolTx: { safeHash, wagmiHash } });
        return null; // Trigger a re-query with the new wagmiHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        const logs = parseEventLogs({
          abi: poolFactoryAbi[poolType],
          logs: txReceipt.logs,
        });

        if (logs.length > 0 && "args" in logs[0] && "pool" in logs[0].args) {
          const newPoolAddress = logs[0].args.pool;
          updatePool({ poolAddress: newPoolAddress, step: 2 });
          return newPoolAddress;
        } else {
          throw new Error("Pool address not found in PoolCreated event logs");
        }
      } else {
        throw new Error("Create pool transaction reverted");
      }
    },
    enabled: Boolean(!poolAddress && (safeHash || wagmiHash)),
  });
}
