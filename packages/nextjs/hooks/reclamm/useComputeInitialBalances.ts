import { usePoolCreationStore } from "../v3";
import { PoolType } from "@balancer/sdk";
import { useQuery } from "@tanstack/react-query";
import { Address, parseAbi, parseUnits } from "viem";
import { usePublicClient } from "wagmi";

export const useComputeInitialBalances = (
  poolAddress: Address | undefined,
  tokenAddress: Address,
  humanAmount: string,
  tokenDecimals: number | undefined,
) => {
  const client = usePublicClient();
  const { poolType } = usePoolCreationStore();
  const isReClamm = poolType === PoolType.ReClamm;

  return useQuery({
    queryKey: ["computeInitialBalancesRaw", humanAmount, poolAddress, tokenAddress, tokenDecimals],
    queryFn: async () => {
      if (!client) throw new Error("client not found for fetching reclamm initial balances");
      if (!poolAddress) throw new Error("pool address required to fetch reclamm initial balances");
      if (!tokenDecimals) throw new Error("token decimals required to fetch reclamm initial balances");

      const rawAmount = parseUnits(humanAmount, tokenDecimals);

      return await client.readContract({
        address: poolAddress,
        abi: parseAbi(["function computeInitialBalancesRaw(address, uint256) view returns (uint256[])"]),
        functionName: "computeInitialBalancesRaw",
        args: [tokenAddress, rawAmount],
      });
    },
    enabled: !!poolAddress && !!tokenAddress && !!humanAmount && !!tokenDecimals && isReClamm,
  });
};
