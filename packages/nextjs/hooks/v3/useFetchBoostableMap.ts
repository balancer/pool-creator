import { useQuery } from "@tanstack/react-query";
import { Address } from "viem";
import { useApiConfig } from "~~/hooks/balancer";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Token } from "~~/hooks/token/types";

export type BoostedTokenInfo = {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
};

/**
 * @TODO change so this hook accepts underlying token address as arg and finds the boosted version using fetch to balancer api
 */

export const useFetchBoostableMap = () => {
  const { url, chainName } = useApiConfig();
  const { targetNetwork } = useTargetNetwork();

  return useQuery<Record<Address, Token>>({
    queryKey: ["fetchBoostableTokens", chainName],
    queryFn: async () => {
      const response = await fetch("https://raw.githubusercontent.com/balancer/metadata/main/erc4626/index.json");

      const boostableWhitelist: BoostableWhitelist = await response.json();

      const boostableTokensAddresses = boostableWhitelist.map(list => {
        return list.addresses[targetNetwork.id].map(address => `"${address}"`).join(",");
      });

      const query = `
            {
              tokenGetTokens(
              chains:[${chainName}]
              where: {tokensIn: [${boostableTokensAddresses}]}
              ) {
                chainId
                address
                name
                symbol
                decimals
                logoURI
                isErc4626
                underlyingTokenAddress
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

      console.log("query", query);

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const json = await res.json();

      const data = json.data.tokenGetTokens;

      const boostableTokensMap = data.reduce((acc: Record<Address, Token>, token: Token) => {
        if (token.underlyingTokenAddress) acc[token.underlyingTokenAddress] = token;
        return acc;
      }, {});

      console.log("boostableTokensMap", boostableTokensMap);

      return boostableTokensMap;
    },
  });
};

type BoostableWhitelist = {
  id: string;
  name: string;
  description: string;
  addresses: {
    [key: string]: Address[];
  };
}[];
