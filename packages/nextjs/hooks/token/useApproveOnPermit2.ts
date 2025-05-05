import { MaxUint48, MaxUint160, permit2Abi } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { PERMIT2_ADDRESS } from "~~/utils/constants";

type ApproveOnPermit2Payload = {
  token: Address;
  spender: Address;
};

// Using permit2 contract, approve the Router to spend the connected account's account's tokens
export const useApproveOnPermit2 = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const chainId = publicClient?.chain.id;

  const writeTx = useTransactor();

  const approve = async ({ token, spender }: ApproveOnPermit2Payload) => {
    if (!walletClient) throw new Error("No wallet client found");
    if (!publicClient) throw new Error("No public client found");
    if (!chainId) throw new Error("No chain id found on public client");

    const { request: approveSpenderOnToken } = await publicClient.simulateContract({
      address: PERMIT2_ADDRESS,
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

  return useMutation({
    mutationFn: (payload: ApproveOnPermit2Payload) => approve(payload),
    onError: error => {
      console.error(error);
    },
  });
};
