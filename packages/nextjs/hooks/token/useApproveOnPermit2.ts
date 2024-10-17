import { MaxUint48, MaxUint160, PERMIT2, permit2Abi } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type ApproveOnPermit2Payload = {
  token: Address;
  spender: Address;
};

// Using permit2 contract, approve the Router to spend the connected account's account's tokens
export const useApproveOnPermit2 = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain.id;

  console.log("walletClient", walletClient);
  console.log("publicClient", publicClient);
  const writeTx = useTransactor();

  const approve = async ({ token, spender }: ApproveOnPermit2Payload) => {
    if (!token) throw new Error("Cannot approve token without token address");
    if (!spender) throw new Error("Cannot approve token without spender address (the pool)");
    if (!walletClient) throw new Error("No wallet client found");
    if (!publicClient) throw new Error("No public client found");
    if (!chainId) throw new Error("No chain id found on public client");

    const { request: approveSpenderOnToken } = await publicClient.simulateContract({
      address: PERMIT2[chainId],
      abi: permit2Abi,
      functionName: "approve",
      account: walletClient.account,
      args: [token, spender, MaxUint160, Number(MaxUint48)],
    });

    await writeTx(() => walletClient.writeContract(approveSpenderOnToken), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Using permit2 contract, user approved Router to spend max amount of", token);
      },
    });
  };

  return useMutation({ mutationFn: (payload: ApproveOnPermit2Payload) => approve(payload) });
};
