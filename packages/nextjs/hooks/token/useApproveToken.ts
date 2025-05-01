import { useMutation } from "@tanstack/react-query";
import { Address, erc20Abi } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type ApproveOnTokenPayload = {
  token: Address | undefined;
  spender: Address | undefined;
  rawAmount: bigint;
};

type UseApproveTokenOptions = {
  onSafeTxHash?: (safeHash: `0x${string}`) => void;
  onWagmiTxHash?: (wagmiHash: `0x${string}`) => void;
};

export const useApproveToken = ({ onSafeTxHash, onWagmiTxHash }: UseApproveTokenOptions) => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const approve = async ({ token, spender, rawAmount }: ApproveOnTokenPayload) => {
    if (!token) throw new Error("useApproveToken: token is undefined");
    if (!spender) throw new Error("useApproveToken: spender is undefined");
    if (!walletClient) throw new Error("useApproveToken: wallet client is undefined");
    if (!publicClient) throw new Error("useApproveToken: public client is undefined");

    const { request: approveSpenderOnToken } = await publicClient.simulateContract({
      address: token,
      abi: erc20Abi,
      functionName: "approve",
      account: walletClient.account,
      args: [spender, rawAmount],
    });

    const txHash = await writeTx(() => walletClient.writeContract(approveSpenderOnToken), {
      onSafeTxHash: onSafeTxHash,
      onWagmiTxHash: onWagmiTxHash,
    });
    console.log("Approved pool contract to spend token, txHash:", txHash);
    return txHash;
  };

  return useMutation({ mutationFn: (payload: ApproveOnTokenPayload) => approve(payload) });
};
