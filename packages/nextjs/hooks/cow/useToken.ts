import { erc20Abi } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { usePublicClient, useReadContract, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

type UseToken = {
  allowance: bigint;
  refetchAllowance: () => void;
  balance: bigint;
  refetchBalance: () => void;
  approve: (amount: bigint) => Promise<void>;
};

export const useToken = (token: Address | undefined, spender: Address): UseToken => {
  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  // Balance of token for the connected account
  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Allowance of token for spender from the connected account
  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [connectedAddress, spender],
  });

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

  return {
    allowance: allowance ? allowance : 0n,
    refetchAllowance,
    balance: balance ? balance : 0n,
    refetchBalance,
    approve,
  };
};
