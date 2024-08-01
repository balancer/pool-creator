import { type ExistingPool } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "~~/hooks/balancer";

/**
 * Fetch CoW AMMs to see if user is trying to create a duplicate pool
 * with same two tokens, weights, and swap fees
 */
export const useFetchExistingPools = () => {
  const { url, chainName } = useApiConfig();

  const query = `
  {
    poolGetPools (where: {chainIn:[${chainName}], poolTypeIn:COW_AMM, tagNotIn: ["BLACK_LISTED"]}) {
        chain
        id
        address
        type
        dynamicData {
          swapFee
        }
        allTokens {
            address
            weight
        }
    }
  }
  `;

  return useQuery<ExistingPool[]>({
    queryKey: ["fetchExistingPools", chainName],
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

      return json.data.poolGetPools;
    },
  });
};
