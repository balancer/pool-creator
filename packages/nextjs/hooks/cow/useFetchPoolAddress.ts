import { useEffect, useState } from "react";
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

export function useFetchPoolAddress() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isSafeWallet = useIsSafeWallet();
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const createPoolTxHash = poolCreation?.createPoolTxHash;
  const pendingSafeTxHash = poolCreation?.pendingSafeTxHash;
  const poolAddress = poolCreation?.address;

  useEffect(() => {
    if (poolAddress) return; // if pool address already in state, no need to fetch

    async function fetchPoolAddress() {
      if (!publicClient) throw new Error("No public client for fetching pool address");
      if (!isSafeWallet && !createPoolTxHash) return; // if not safe wallet, only run if createPoolTxHash has been captured
      if (isSafeWallet && !pendingSafeTxHash && !createPoolTxHash) return; // if safe wallet, only run if createPoolTxHash has not been captured
      try {
        console.log("Fetching pool address from useFetchPoolAddress()");
        setIsPending(true);

        if (isSafeWallet && pendingSafeTxHash && !createPoolTxHash) {
          const hash = await pollSafeTxStatus(sdk, pendingSafeTxHash);
          // safe tx hash no longer pending, and now we have the createPoolTxHash
          updatePoolCreation({ pendingSafeTxHash: undefined, createPoolTxHash: hash });
        }

        if (!createPoolTxHash) return;
        const txReceipt = await publicClient.waitForTransactionReceipt({ hash: createPoolTxHash });

        const logs = parseEventLogs({
          abi: abis.CoW.BCoWFactory,
          logs: txReceipt.logs,
        });

        const newPoolAddress = (logs[0].args as { caller: string; bPool: string }).bPool;
        if (!newPoolAddress) throw new Error("No new pool address from pool creation tx receipt");

        updatePoolCreation({ address: newPoolAddress, step: 2 });
      } catch (error) {
        console.error("Error fetching transaction receipt:", error);
        setError(error as Error);
      } finally {
        setIsPending(false);
      }
    }

    fetchPoolAddress();
  }, [publicClient, createPoolTxHash, poolAddress, pendingSafeTxHash, sdk, isSafeWallet, updatePoolCreation]);

  return { isPending, error };
}
