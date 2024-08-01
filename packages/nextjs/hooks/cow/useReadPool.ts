import { type BCowPool } from "./types";
import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";

const abi = abis.CoW.BCoWPool;

export const useReadPool = (address: Address) => {
  const client = usePublicClient();

  return useQuery<BCowPool>({
    queryKey: ["BCoWPool", address],
    queryFn: async () => {
      if (!client) throw new Error("Client not found");

      const [isFinalized, getNumTokens, getCurrentTokens, getSwapFee, MAX_FEE] = await Promise.all([
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

      return { address, isFinalized, getNumTokens, getCurrentTokens, getSwapFee, MAX_FEE };
    },
    enabled: !!address,
  });
};

export type RefetchPool = ReturnType<typeof useReadPool>["refetch"];
