import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

export function useFetchPoolAddress() {
  const isSafeWallet = useIsSafeWallet();
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const { createPoolTxHash, pendingSafeTxHash, poolAddress } = poolCreation ?? {};

  return useQuery({
    queryKey: ["cowPoolAddress", createPoolTxHash, pendingSafeTxHash],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");

      // If safe wallet, poll for safe tx status to update createPoolTxHash
      if (isSafeWallet && pendingSafeTxHash && !createPoolTxHash) {
        const hash = await pollSafeTxStatus(sdk, pendingSafeTxHash);
        updatePoolCreation({ createPoolTxHash: hash });
        return null; // Trigger a re-query with the new createPoolTxHash
      }

      if (!createPoolTxHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: createPoolTxHash });

      const logs = parseEventLogs({
        abi: abis.CoW.BCoWFactory,
        logs: txReceipt.logs,
      });

      const newPoolAddress = (logs[0].args as { caller: string; bPool: string }).bPool;
      if (!newPoolAddress) throw new Error("No new pool address from pool creation tx receipt");

      updatePoolCreation({ poolAddress: newPoolAddress, step: 2 });
      return newPoolAddress;
    },
    enabled: Boolean(!poolAddress && (createPoolTxHash || pendingSafeTxHash)),
  });
}
