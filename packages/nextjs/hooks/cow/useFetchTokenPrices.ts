import { useQuery } from "@tanstack/react-query";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { chainIdToName } from "~~/utils/constants";

export type TokenPrice = {
  chain: string;
  adddress: string;
  price: number;
  updatedAt: number;
};

export const useFetchTokenPrices = () => {
  const { targetNetwork } = useTargetNetwork();

  const chainName = chainIdToName[targetNetwork.id];

  const query = `{
                    tokenGetCurrentPrices(chains:${chainName}) {
                    chain
                    address
                    price
                    updatedAt
                    }
                  }`;

  return useQuery<TokenPrice[]>({
    queryKey: ["fetchTokenPrices", targetNetwork.id],
    queryFn: async () => {
      const response = await fetch("https://api-v3.balancer.fi/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error("Error fetching token list from balancer API");
      }

      return json.data.tokenGetCurrentPrices;
    },
  });
};
