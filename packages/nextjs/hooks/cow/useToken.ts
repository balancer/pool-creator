import { erc20Abi } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { useReadContract, useWalletClient } from "wagmi";

/**
 * Custom hook for dealing with a single token
 */
export const useToken = (token: Address | undefined, spender: Address) => {
  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;

  // Balance of token for the connected account
  const { data: tokenBalance, refetch: refetchTokenBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [connectedAddress],
  });

  // Allowance for Router to spend account's tokens from Permit2
  const { data: tokenAllowance, refetch: refetchTokenAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [connectedAddress, spender],
  });

  return {
    tokenAllowance: tokenAllowance ? tokenAllowance : 0n,
    refetchTokenAllowance,
    tokenBalance: tokenBalance ? tokenBalance : 0n,
    refetchTokenBalance,
  };
};
