import { useQuery } from "@tanstack/react-query";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";

export const useWaitForTransactionReceipt = () => {
  const publicClient = usePublicClient();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const createPoolTxHash = poolCreation?.createPoolTxHash;
  const poolAddress = poolCreation?.address;

  return useQuery({
    queryKey: ["fetch-createPool-tx-receipt", createPoolTxHash],
    queryFn: async () => {
      if (!publicClient) throw new Error("Missing public client for fetching pool creation tx receipt");
      if (!createPoolTxHash) return "No need to fetch receipt yet";
      if (poolAddress) return poolAddress;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: createPoolTxHash });
      const logs = parseEventLogs({
        abi: abis.CoW.BCoWFactory,
        logs: txReceipt.logs,
      });

      const newPoolAddress = (logs[0].args as { caller: string; bPool: string }).bPool;
      if (!newPoolAddress) throw new Error("No new pool address from pool creation tx receipt");

      updatePoolCreation({ address: newPoolAddress, step: 2 });

      return newPoolAddress;
    },
  });
};
