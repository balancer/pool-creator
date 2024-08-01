import { type Token } from "./types";
import { useQuery } from "@tanstack/react-query";
import { sepolia } from "viem/chains";
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

      // Hardcoded token list for sepolia testing
      if (chainName === "SEPOLIA") {
        return SEPOLIA_FAUCET_TOKENS;
      } else {
        return json.data.tokenGetTokens;
      }
    },
  });
};

const chainId = sepolia.id;
const SEPOLIA_FAUCET_TOKENS = [
  {
    chainId,
    address: "0x80D6d3946ed8A1Da4E226aa21CCdDc32bd127d1A",
    name: "USD Coin",
    symbol: "USDC",
    decimals: 6,
    logoURI: "",
  },
  {
    chainId,
    address: "0xb19382073c7A0aDdbb56Ac6AF1808Fa49e377B75",
    name: "Balancer Governance Token",
    symbol: "BAL",
    decimals: 18,
    logoURI: "",
  },
  {
    chainId,
    address: "0x0f409E839a6A790aecB737E4436293Be11717f95",
    name: "BeethovenxToken",
    symbol: "BEETS",
    decimals: 18,
    logoURI: "",
  },
  {
    chainId,
    address: "0xB77EB1A70A96fDAAeB31DB1b42F2b8b5846b2613",
    name: "Dai Stablecoin",
    symbol: "DAI",
    decimals: 18,
    logoURI: "",
  },
  {
    chainId,
    address: "0x6bF294B80C7d8Dc72DEE762af5d01260B756A051",
    name: "Tether USD",
    symbol: "USDT",
    decimals: 6,
    logoURI: "",
  },
];
