import { type ExistingPool } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "~~/hooks/balancer";

/**
 * Fetch CoW AMMs to see if user is trying to create a duplicate pool
 * with same two tokens and weights
 */
export const useCheckIfPoolExists = (proposedPoolTokenMap: Map<string, string>) => {
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

  const { data: existingPools } = useQuery<ExistingPool[]>({
    queryKey: ["existingPools", chainName],
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

  const existingPool = existingPools?.find(existingPool => {
    if (proposedPoolTokenMap.size !== existingPool.allTokens.length) return false;

    const existingPoolTokens = existingPool.allTokens;

    // Check if existing pool has all the same tokens with the same weights as potential new pool
    return existingPoolTokens.every(existingToken => {
      const existingPoolTokenWeight = normalizeWeight(existingToken.weight);
      const existingPoolTokenAddress = existingToken.address.toLowerCase();
      const proposedPoolTokenWeight = proposedPoolTokenMap.get(existingPoolTokenAddress);

      // If proposed pool token map doesnt include token from existing pool, it's not an exact match
      if (proposedPoolTokenWeight === undefined) return false;

      return existingPoolTokenWeight === proposedPoolTokenWeight;
    });
  });

  // Don't prevent pool duplication on testnet since limited number of faucet tokens
  if (chainName === "SEPOLIA") {
    return { existingPool: undefined };
  }

  return { existingPool };
};

/**
 * API returns weights like "0.5" but we are using "50" for this pool creation UI codebase
 * "0.5" -> "50"
 * "0.8" -> "80"
 * "0.2" -> "20"
 */
function normalizeWeight(weight: string): string {
  const numWeight = parseFloat(weight);
  return numWeight < 1 ? (numWeight * 100).toString() : weight;
}
