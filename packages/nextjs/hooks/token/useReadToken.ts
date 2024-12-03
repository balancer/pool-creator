import { erc20Abi } from "@balancer/sdk";
// import { createSyncStoragePersister } from "@tanstack/query-sync-storage";
import { Address, zeroAddress } from "viem";
import { useReadContract, useWalletClient } from "wagmi";

export const useReadToken = (token: Address | undefined, spender?: Address) => {
  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;
  // const persister = createSyncStoragePersister({
  //   storage: window.localStorage,
  // });
  const { data: name, isLoading: isLoadingName } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "name",
  });

  const { data: symbol, isLoading: isLoadingSymbol } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "symbol",
  });

  const { data: decimals, isLoading: isLoadingDecimals } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "decimals",
  });

  const { data: balance, refetch: refetchBalance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [connectedAddress],
    // query: {
    //   enabled: !!token && !!connectedAddress,
    //   gcTime: Infinity,
    //   staleTime: 30_000, // Consider data fresh for 30 seconds
    //   persister: persister,
    // },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [connectedAddress, spender ?? zeroAddress],
  });

  return {
    name,
    isLoadingName,
    symbol,
    isLoadingSymbol,
    decimals,
    isLoadingDecimals,
    allowance: allowance ? allowance : 0n,
    refetchAllowance,
    balance: balance ? balance : 0n,
    refetchBalance,
  };
};
