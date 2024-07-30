import { erc20Abi } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type UseReadToken = {
  approve: (amount: bigint) => Promise<void>;
};

export const useWriteToken = (token: Address = zeroAddress, spender: Address): UseReadToken => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const approve = async (rawAmount: bigint) => {
    if (!token) throw new Error("No token address selected!");
    if (!walletClient) throw new Error("No wallet client found!");
    if (!publicClient) throw new Error("No public client found!");

    try {
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
          console.log("Approved  contract to spend max amount of", token);
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  return { approve };
};
