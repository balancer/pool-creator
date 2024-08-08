import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const useFinalizePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

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

    await writeTx(() => walletClient.writeContract(finalizePool), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Successfully finalized pool:", pool);
      },
    });
  };

  return useMutation({ mutationFn: (pool: Address | undefined) => finalize(pool) });
};
