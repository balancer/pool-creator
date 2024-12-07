import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";

/**
 * Fetch token price for a given address
 */
export const useFetchTokenPrices = () => {
  const { url, chainName } = useApiConfig();

  // API seems to only return full list with no filtering options?
  const query = `
  {
    tokenGetCurrentPrices(chains:${chainName}) {
      address
      price
    }
  }
  `;

  return useQuery<TokenPrice[]>({
    queryKey: ["fetchTokenPrice", chainName],
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

export type TokenPrice = {
  address: Address;
  price: number;
};
