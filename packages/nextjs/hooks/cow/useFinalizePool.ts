import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const useFinalizePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications
  const { updatePoolCreation } = usePoolCreationStore();
  const finalize = async (pool: Address | undefined) => {
    if (!publicClient) throw new Error("No public client found!");
    if (!walletClient) throw new Error("No wallet client found!");
    if (!pool) throw new Error("No pool address found!");

    const { request: finalizePool } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "finalize",
      account: walletClient.account,
    });

    const txHash = await writeTx(() => walletClient.writeContract(finalizePool), {
      onSafeTxHash: safeHash => {
        updatePoolCreation({ finalizePoolTx: { safeHash, wagmiHash: undefined, isSuccess: false } });
      },
      onWagmiTxHash: wagmiHash => {
        updatePoolCreation({ finalizePoolTx: { wagmiHash, safeHash: undefined, isSuccess: false } });
      },
    });
    return txHash;
  };

  return useMutation({ mutationFn: (pool: Address | undefined) => finalize(pool) });
};
