import { type Token } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "~~/hooks/balancer";

/**
 * Fetch list of tokens to display in the token selector modal
 */
export const useFetchTokenList = () => {
  const { url, chainName } = useApiConfig();

  const query = `
  {
    tokenGetTokens(chains:${chainName}) {
      chainId
      address
      name
      symbol
      decimals
      logoURI
      isErc4626
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

  return useQuery<Token[]>({
    queryKey: ["fetchTokenList", chainName],
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

      const tokenList = json.data.tokenGetTokens.filter((token: Token) => token.address !== NATIVE_ASSET_ADDRESS);

      return tokenList;
    },
  });
};

const NATIVE_ASSET_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
