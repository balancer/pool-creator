import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";

/**
 * Fetch pool details for a CoW AMM
 */
export const useCowPool = (address: Address) => {
  const client = usePublicClient();
  const abi = abis.CoW.BCoWPool;

  return useQuery({
    queryKey: ["BCoWPool", address],
    queryFn: async () => {
      if (!client) throw new Error("Client not found");

      const [isFinalized, getNumTokens, getCurrentTokens, getSwapFee] = await Promise.all([
        client.readContract({
          abi,
          address,
          functionName: "isFinalized",
        }),
        client.readContract({
          abi,
          address,
          functionName: "getNumTokens",
        }),
        client.readContract({
          abi,
          address,
          functionName: "getCurrentTokens",
        }),
        client.readContract({
          abi,
          address,
          functionName: "getSwapFee",
        }),
        // NOTICE: getFinalTokens reverts if pool has not been finalized
        // client.readContract({
        //   abi,
        //   address,
        //   functionName: "getFinalTokens",
        // }),
      ]);

      return { isFinalized, getNumTokens, getCurrentTokens, getSwapFee };
    },
    enabled: !!address,
  });
};
