import { useQuery } from "@tanstack/react-query";
import { Address, isAddress, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

export const useFetchTokenRate = (address: Address | undefined) => {
  const publicClient = usePublicClient();

  const isValidAddress = address ? isAddress(address) : false;

  return useQuery({
    queryKey: ["fetchTokenRate", address],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("No public client for validateRateProvider");
        const rate = await publicClient.readContract({
          address: address as Address,
          abi: parseAbi(["function getRate() external view returns (uint256)"]),
          functionName: "getRate",
          args: [],
        });
        return rate;
      } catch {
        throw new Error("Invalid rate provider");
      }
    },
    enabled: !!address && isValidAddress,
    // staleTime: 0, // Always consider data stale
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });
};
