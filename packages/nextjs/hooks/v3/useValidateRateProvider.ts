import { useQuery } from "@tanstack/react-query";
import { Address, isAddress, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

export const useValidateRateProvider = (isRateProvider: boolean | undefined, value: string | undefined) => {
  const publicClient = usePublicClient();

  return useQuery({
    queryKey: ["validateRateProvider", value],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("No public client for validateRateProvider");
        const rate = await publicClient.readContract({
          address: value as Address,
          abi: parseAbi(["function getRate() external view returns (uint256)"]),
          functionName: "getRate",
          args: [],
        });
        console.log("getRate()", rate);
        return true;
      } catch {
        return false;
      }
    },
    enabled: isRateProvider && !!value && isAddress(value as string),
  });
};
