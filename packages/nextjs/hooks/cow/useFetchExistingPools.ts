import { useQuery } from "@tanstack/react-query";

// import { useTargetNetwork } from "~~/hooks/scaffold-eth";
// import { chainIdToName } from "~~/utils/constants";

/**
 * Fetch CoW AMMs to see if user is trying to create a duplicate pool
 * i.e. same two tokens, same weight, and same swap fee
 */
export const useFetchExistingPools = () => {
  //   const { targetNetwork } = useTargetNetwork();
  //   const chainName = chainIdToName[targetNetwork.id];

  const query = `
                {
                    poolGetPools (where: {chainIn:[SEPOLIA,MAINNET,GNOSIS], poolTypeIn:COW_AMM}) {
                        chain
                        address
                        type
                        allTokens {
                            address
                        }
                    }
                }
                `;

  return useQuery({
    queryKey: ["fetchExistingPools"],
    queryFn: async () => {
      const response = await fetch("https://api-v3.balancer.fi/", {
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
};
