import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Token } from "~~/hooks/token/types";

/**
 * 1. Fetch whitelist of yield bearing erc4626 tokens from https://github.com/balancer/metadata/blob/main/erc4626/index.json
 * 2. Fetch data from balancer api for each token in whitelist
 * 3. Return map of underlying token address to boosted token info
 */

export const useBoostableWhitelist = () => {
  const { url, chainName } = useApiConfig();
  const { targetNetwork } = useTargetNetwork();

  return useQuery<Record<Address, Token>>({
    queryKey: ["fetchBoostableTokens", chainName],
    queryFn: async () => {
      const response = await fetch("https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json");

      const boostableWhitelist: BoostableWhitelist = await response.json();

      const boostableAddresses = boostableWhitelist
        .filter(list => list.id === "boosted_aave")
        .map(list => list.addresses[targetNetwork.id] || [])
        .flat()
        .map(address => `"${address}"`)
        .join(",");

      if (!boostableAddresses) {
        console.log("No boostable addresses found for network:", targetNetwork.id);
        return {};
      }

      const query = `
            {
              tokenGetTokens(
              chains:[${chainName}]
              where: {tokensIn: [${boostableAddresses}]}
              ) {
                chainId
                address
                name
                symbol
                decimals
                logoURI
                isErc4626
                underlyingTokenAddress
                isBufferAllowed
                priceRateProviderData {
                  address
                  summary
                  name
                  reviewed
                  warnings
                  reviewFile
              }
              }
            }
            `;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      const data = json.data.tokenGetTokens;

      // Create map of underlying token address to matching boosted variant info
      // If the token has an underlyingTokenAddress and isBufferAllowed
      const boostableTokensMap = data.reduce((acc: Record<Address, Token>, token: Token) => {
        if (token.underlyingTokenAddress && token.isBufferAllowed) acc[token.underlyingTokenAddress] = token;
        return acc;
      }, {});

      return boostableTokensMap;
    },
  });
};

type BoostableWhitelist = {
  id: string;
  name: string;
  description: string;
  icon: string;
  addresses: {
    [key: string]: Address[];
  };
}[];
