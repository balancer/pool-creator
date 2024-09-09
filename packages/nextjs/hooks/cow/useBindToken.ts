import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { getDenormalizedTokenWeight, SupportedTokenWeight } from "~~/utils/token-weights";

type BindPayload = {
  pool: Address | undefined;
  token: Address;
  rawAmount: bigint;
};

export const useBindToken = (tokenWeights: SupportedTokenWeight, isToken1: boolean) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications
  const denormalizedTokenWeight = getDenormalizedTokenWeight(tokenWeights, isToken1);

  const bind = async ({ pool, token, rawAmount }: BindPayload) => {
    if (!pool) throw new Error("Cannot bind token without pool address");
    if (!publicClient) throw new Error("No public client found");
    if (!walletClient) throw new Error("No wallet client found");

    const { request: bind } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "bind",
      account: walletClient.account,
      args: [token, rawAmount, denormalizedTokenWeight],
    });

    await writeTx(() => walletClient.writeContract(bind), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Bound token:", token, "to pool:", pool);
      },
    });
  };

  return useMutation({ mutationFn: (payload: BindPayload) => bind(payload) });
};
