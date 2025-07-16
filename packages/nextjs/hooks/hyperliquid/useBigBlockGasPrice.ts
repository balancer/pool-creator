import { useIsHyperEvm } from "./useIsHyperEvm";
import { ChainId } from "@balancer/sdk";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { useAccount } from "wagmi";

``;
export const useBigBlockGasPrice = () => {
  const isHyperEvm = useIsHyperEvm();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  return useQuery({
    queryKey: ["bigBlockGasPrice", publicClient?.chain.id, address],
    queryFn: async () => {
      if (!publicClient || !address) return false;
      if (publicClient.chain.id !== ChainId.HYPER_EVM) return false;

      const bigBlockGasPrice: bigint = await publicClient.transport.request({
        method: "eth_bigBlockGasPrice",
      });
      return bigBlockGasPrice;
    },
    enabled: isHyperEvm,
  });
};
