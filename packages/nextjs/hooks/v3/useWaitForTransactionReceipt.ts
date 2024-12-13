import { useEffect, useState } from "react";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { poolFactoryAbi, usePoolCreationStore } from "~~/hooks/v3/";

/**
 * Fetches tx receipt from tx hash if user disconnects during pending tx state
 * @returns Flag to indicate if tx receipt is being fetched
 */
export const useWaitForTransactionReceipt = () => {
  const [isLoadingTxReceipt, setIsLoadingTxReceipt] = useState(false);
  const publicClient = usePublicClient();
  const { createPoolTxHash, initPoolTxHash, poolType, step, updatePool, hasBeenInitialized } = usePoolCreationStore();

  // If user disconnects during pending tx state, these useEffect hooks will attempt to get tx receipt based on tx hash already saved in local storage
  useEffect(() => {
    async function getPoolCreationTxReceipt() {
      if (!publicClient || !createPoolTxHash || poolType === undefined || step !== 1) return;
      console.log("Fetching tx receipt from create pool tx hash...");
      setIsLoadingTxReceipt(true);
      try {
        const txReceipt = await publicClient.waitForTransactionReceipt({ hash: createPoolTxHash });
        if (txReceipt.status === "success") {
          // Parse "PoolCreated" event logs to get pool address
          const logs = parseEventLogs({
            abi: poolFactoryAbi[poolType],
            logs: txReceipt.logs,
          });
          if (logs.length > 0 && "args" in logs[0] && "pool" in logs[0].args) {
            const newPool = logs[0].args.pool;
            updatePool({ poolAddress: newPool, step: 2 });
          } else {
            throw new Error("Pool address not found in PoolCreated event logs");
          }
        } else {
          throw new Error("Create pool transaction reverted");
        }
      } catch (error) {
        console.error("Error getting create pool transaction receipt:", error);
      } finally {
        setIsLoadingTxReceipt(false);
      }
    }
    getPoolCreationTxReceipt();
  }, [createPoolTxHash, publicClient, poolType, updatePool, step]);

  // Handle edge case where user disconnects while pool init tx is pending
  useEffect(() => {
    async function getPoolInitTxReceipt() {
      if (!publicClient || !initPoolTxHash || hasBeenInitialized) return;
      console.log("Fetching tx receipt from init pool tx hash...");
      try {
        setIsLoadingTxReceipt(true);
        const txReceipt = await publicClient.waitForTransactionReceipt({ hash: initPoolTxHash });
        if (txReceipt.status === "success") updatePool({ step: step + 1, hasBeenInitialized: true });
      } catch (error) {
        console.error("Error getting init pool transaction receipt:", error);
      } finally {
        setIsLoadingTxReceipt(false);
      }
    }
    getPoolInitTxReceipt();
  }, [initPoolTxHash, publicClient, updatePool, step, hasBeenInitialized]);

  return { isLoadingTxReceipt };
};
