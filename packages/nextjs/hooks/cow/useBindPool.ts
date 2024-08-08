import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";

type BindPayload = {
  pool: Address | undefined;
  token: Address;
  rawAmount: bigint;
};

const DENORMALIZED_WEIGHT = 1000000000000000000n; // bind 2 tokens with 1e18 weight for each to get a 50/50 pool

export const useBindPool = (refetchPool: () => void) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const bind = async ({ pool, token, rawAmount }: BindPayload) => {
    if (!pool) throw new Error("Cannot bind token without pool address");
    if (!publicClient) throw new Error("No public client found");
    if (!walletClient) throw new Error("No wallet client found");

    const { request: bind } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "bind",
      account: walletClient.account,
      args: [token, rawAmount, DENORMALIZED_WEIGHT],
    });

    await writeTx(() => walletClient.writeContract(bind), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Bound token:", token, "to pool:", pool);
        refetchPool();
      },
    });

    return "success";
  };

  return useMutation({
    mutationFn: (payload: BindPayload) => bind(payload),
  });
};
