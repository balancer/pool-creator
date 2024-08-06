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

    return hasOnlyTwoTokens && includesToken1 && includesToken2;
  });

  // Don't prevent pool duplication on testnet since limited number of faucet tokens
  if (chainName === "SEPOLIA") {
    return { existingPool: undefined };
  }

  return { existingPool };
};
