import { type ExistingPool } from "./types";
import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";

/**
 * Fetch CoW AMMs to see if user is trying to create a duplicate pool
 * with same two tokens, weights, and swap fees
 */
export const useCheckIfPoolExists = (token1: Address | undefined, token2: Address | undefined) => {
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

  const {
    data: existingPools,
    // isLoading,
    // isError,
  } = useQuery<ExistingPool[]>({
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

  const existingPool = existingPools?.find(pool => {
    if (!token1 || !token2) return false;
    const poolTokenAddresses = pool.allTokens.map(token => token.address);
    const hasOnlyTwoTokens = poolTokenAddresses.length === 2;
    const selectedToken1 = token1.toLowerCase() ?? "";
    const selectedToken2 = token2.toLowerCase() ?? "";
    const includesToken1 = poolTokenAddresses.includes(selectedToken1);
    const includesToken2 = poolTokenAddresses.includes(selectedToken2);
    const has5050Weight = pool.allTokens.every(token => token.weight === "0.5");
    const hasMaxSwapFee = pool.dynamicData.swapFee === "0.999999";
    return hasOnlyTwoTokens && has5050Weight && hasMaxSwapFee && includesToken1 && includesToken2;
  });

  return { existingPool };
  // return { existingPool: undefined };
};
