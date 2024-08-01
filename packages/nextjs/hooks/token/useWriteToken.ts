import { erc20Abi } from "@balancer/sdk";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type UseWriteToken = {
  approve: (amount: bigint) => Promise<void>;
};

export const useWriteToken = (token: Address | undefined, spender: Address | undefined): UseWriteToken => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const approve = async (rawAmount: bigint) => {
    if (!token) throw new Error("Cannot approve token without token address");
    if (!spender) throw new Error("Cannot approve token without spender address");
    if (!walletClient) throw new Error("No wallet client found");
    if (!publicClient) throw new Error("No public client found");

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
