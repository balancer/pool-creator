import { AllowedPoolTypes } from "./usePoolCreationStore";
import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";

export type ExistingPool = {
  chain: "string";
  address: Address;
  name: string;
  symbol: string;
  type: "string";
  protocolVersion: number;
  allTokens: {
    address: Address;
    weight: string;
  }[];
  dynamicData: {
    swapFee: string;
  };
};

/**
 * Fetch all v3 poolsto see if user is trying to create a similar pool
 */
export const useCheckIfV3PoolExists = (type: AllowedPoolTypes | undefined, tokenAddresses: Address[]) => {
  const { url, chainName } = useApiConfig();

  const query = `
  {
    poolGetPools (where: {chainIn:[${chainName}], poolTypeIn:[${type?.toUpperCase()}], tokensIn:[${tokenAddresses
    .map(address => `"${address}"`)
    .join(",")}], protocolVersionIn:[3], tagNotIn: ["BLACK_LISTED"]}) {
        chain
        address
        type
        name
        symbol
        protocolVersion
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
    queryKey: ["existingPools", type, chainName, tokenAddresses],
    queryFn: async () => {
      if (!type || !tokenAddresses) return {};

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

  return { existingPools };
};
