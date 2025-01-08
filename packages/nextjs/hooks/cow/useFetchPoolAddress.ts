import { useEffect, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";

export function useFetchPoolAddress() {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const publicClient = usePublicClient();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const createPoolTxHash = poolCreation?.createPoolTxHash;
  const poolAddress = poolCreation?.address;

  useEffect(() => {
    if (poolAddress) return;

    async function fetchReceipt() {
      if (!publicClient) return;
      if (!createPoolTxHash) return;

      try {
        setIsPending(true);
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

    fetchReceipt();
  }, [publicClient, createPoolTxHash, poolAddress, updatePoolCreation]);

  return { isPending, error };
}
