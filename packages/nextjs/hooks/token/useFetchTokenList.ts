import { type Token } from "./types";
import { useQuery } from "@tanstack/react-query";
import { useApiConfig } from "~~/hooks/balancer";
import { tokenBlacklist } from "~~/utils";

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

      const blacklist: string[] = tokenBlacklist[chainName as keyof typeof tokenBlacklist] || [];

      const tokenList = json.data.tokenGetTokens.filter((token: Token) => {
        const isNativeAsset = token.address === NATIVE_ASSET_ADDRESS;
        const isHyperEvmNativeAsset = chainName === "HYPEREVM" && token.address === HYPE_NATIVE_ASSET_ADDRESS;

        return !isNativeAsset && !isHyperEvmNativeAsset && !blacklist.includes(token.address.toLowerCase());
      });

      return tokenList;
    },
  });
};

const NATIVE_ASSET_ADDRESS = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";
const HYPE_NATIVE_ASSET_ADDRESS = "0x2222222222222222222222222222222222222222";
