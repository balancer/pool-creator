import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";

export type BCowPool = {
  address: Address;
  isFinalized: boolean;
  getNumTokens: bigint;
  getCurrentTokens: Address[];
  getSwapFee: bigint;
  MAX_FEE: bigint;
};

export type RefetchPool = ReturnType<typeof useReadPool>["refetch"];

export const useReadPool = (address: Address) => {
  const client = usePublicClient();
  const abi = abis.CoW.BCoWPool;

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
