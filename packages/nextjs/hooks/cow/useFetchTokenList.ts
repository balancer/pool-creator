import { useQuery } from "@tanstack/react-query";
import { sepolia } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  logoURI: string;
};

export const useFetchTokenList = () => {
  const { targetNetwork } = useTargetNetwork();

  return useQuery<Token[]>({
    queryKey: ["fetchTokenList"],
    queryFn: async () => {
      const response = await fetch("https://api-v3.balancer.fi/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
                  tokenGetTokens(chains:MAINNET) {
                    chainId
                    address
                    name
                    symbol
                    decimals
                    logoURI
                  }
                }`,
        }),
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error("Error fetching token list from balancer API");
      }

      // Hardcoded token list for sepolia testing
      if (targetNetwork.id === sepolia.id) {
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
