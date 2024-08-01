import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "~~/hooks/balancer";
import { type TokenPrice } from "~~/hooks/token";

/**
 * Fetch token prices to help user set 50/50 weight when creating pools?
 */
export const useFetchTokenPrices = () => {
  const { url, chainName } = useApiConfig();

  const query = `
  {
    tokenGetCurrentPrices(chains:${chainName}) {
    chain
    address
    price
    updatedAt
    }
  }
  `;

  return useQuery<TokenPrice[]>({
    queryKey: ["fetchTokenPrices", chainName],
    queryFn: async () => {
      const response = await fetch(url, {
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
