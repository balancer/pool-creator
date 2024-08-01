import { erc20Abi } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { useReadContract, useWalletClient } from "wagmi";

type UseReadToken = {
  allowance: bigint;
  refetchAllowance: () => void;
  balance: bigint;
  refetchBalance: () => void;
  symbol: string | undefined;
  name: string | undefined;
  decimals: number | undefined;
};

export const useReadToken = (token: Address | undefined, spender?: Address): UseReadToken => {
  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;

  const { data: name } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "name",
  });

  const { data: symbol } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const { data: decimals } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [connectedAddress, spender ?? zeroAddress],
  });

  return {
    name,
    symbol,
    decimals,
    allowance: allowance ? allowance : 0n,
    refetchAllowance,
    balance: balance ? balance : 0n,
    refetchBalance,
  };
};
