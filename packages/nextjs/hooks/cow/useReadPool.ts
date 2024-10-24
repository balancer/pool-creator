import { type BCowPool } from "./types";
import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";

const abi = abis.CoW.BCoWPool;

export const useReadPool = (address: Address | undefined) => {
  const client = usePublicClient();

  return useQuery<BCowPool>({
    queryKey: ["BCoWPool", address],
    queryFn: async () => {
      if (!client) throw new Error("Wagmi public client is undefined");
      if (!address) throw new Error("Pool address is undefined");

      const [isFinalized, numTokens, currentTokens, swapFee, MAX_FEE] = await Promise.all([
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
        }) as Promise<Address[]>,
        client.readContract({
          abi,
          address,
          functionName: "getSwapFee",
        }),
        client.readContract({
          abi,
          address,
          functionName: "MAX_FEE",
        }),
      ]);

      return { address, isFinalized, numTokens, currentTokens, swapFee, MAX_FEE };
    },
    enabled: !!address,
  });
};

export type RefetchPool = ReturnType<typeof useReadPool>["refetch"];
