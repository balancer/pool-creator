import { usePoolCreationStore } from "./usePoolCreationStore";
import { useQuery } from "@tanstack/react-query";
import { Address, isAddress, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

export const useValidateRateProvider = (address: string | undefined, tokenConfigIndex: number) => {
  const publicClient = usePublicClient();

  const { updateTokenConfig } = usePoolCreationStore();

  const isValidAddress = address ? isAddress(address) : false;

  return useQuery({
    queryKey: ["validateRateProvider", address],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("No public client for validateRateProvider");
        const rate = await publicClient.readContract({
          address: address as Address,
          abi: parseAbi(["function getRate() external view returns (uint256)"]),
          functionName: "getRate",
          args: [],
        });
        updateTokenConfig(tokenConfigIndex, { isValidRateProvider: true });
        return rate;
      } catch {
        updateTokenConfig(tokenConfigIndex, { isValidRateProvider: false });
        return null;
      }
    },
    enabled: !!address && isValidAddress,
  });
};
