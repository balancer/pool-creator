import { PoolType } from "@balancer/sdk";
import { useQuery } from "@tanstack/react-query";
import { type Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";
import { SupportedPoolTypes } from "~~/utils/constants";

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
export const useCheckIfV3PoolExists = (type: SupportedPoolTypes | undefined, tokenAddresses: Address[]) => {
  const { url, chainName } = useApiConfig();

  // API does not recognize stable surge as pool type like the SDK does
  const poolType = type === PoolType.StableSurge ? PoolType.Stable : type;

  const query = `
  {
    poolGetPools (where: {chainIn:[${chainName}], poolTypeIn:[${poolType?.toUpperCase()}], tokensIn:[${tokenAddresses
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
    queryKey: ["existingPools", poolType, chainName, tokenAddresses],
    queryFn: async () => {
      if (!poolType || !tokenAddresses) return {};

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
