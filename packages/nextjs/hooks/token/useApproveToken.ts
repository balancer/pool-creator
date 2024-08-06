import { erc20Abi } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type ApprovePayload = {
  token: Address | undefined;
  spender: Address | undefined;
  rawAmount: bigint;
};

export const useApproveToken = (refetchAllowances: () => void) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const approve = async ({ token, spender, rawAmount }: ApprovePayload) => {
    if (!token) throw new Error("Cannot approve token without token address");
    if (!spender) throw new Error("Cannot approve token without spender address");
    if (!walletClient) throw new Error("No wallet client found");
    if (!publicClient) throw new Error("No public client found");

    const { request: approveSpenderOnToken } = await publicClient.simulateContract({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      account: walletClient.account,
      args: [spender, rawAmount],
    });

    await writeTx(() => walletClient.writeContract(approveSpenderOnToken), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Approved pool contract to spend amount:", rawAmount, " of token:", token);
        refetchAllowances();
      },
    });
  };

  return useMutation({
    mutationFn: (payload: ApprovePayload) => approve(payload),
  });
};
