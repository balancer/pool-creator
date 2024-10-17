import { useEffect, useState } from "react";
import { PERMIT2, erc20Abi } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { parseUnits } from "viem";
import { useReadContracts, useWalletClient } from "wagmi";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { TokenConfig } from "~~/hooks/v3/usePoolCreationStore";

/**
 * Figure out which tokens have approved the permit2 contract to spend their tokens
 */
export const useAllowancesOnTokens = (tokenConfigs: TokenConfig[]) => {
  const [tokensToApprove, setTokensToApprove] = useState<TokenConfig[]>([]);
  const [sufficientAllowances, setSufficientAllowances] = useState(false);

  const { data: walletClient } = useWalletClient();
  const connectedAddress = walletClient?.account.address || zeroAddress;
  const { targetNetwork } = useTargetNetwork();

  const { data: tokenAllowances, refetch: refetchTokenAllowances } = useReadContracts({
    contracts: tokenConfigs.map(token => ({
      address: token.address,
      abi: erc20Abi,
      functionName: "allowance",
      args: [connectedAddress, PERMIT2[targetNetwork.id]],
    })),
  });

  console.log("tokenAllowances", tokenAllowances);

  useEffect(() => {
    if (tokenAllowances) {
      const tokensNeedingApproval = tokenConfigs.filter((token, index) => {
        const tokenAllowance = tokenAllowances[index].result as bigint;
        const tokenAmount = parseUnits(token.amount, token?.tokenInfo?.decimals ?? 18);
        return tokenAllowance < tokenAmount;
      });
      setTokensToApprove(tokensNeedingApproval);
      // Check if all tokens have sufficient tokenAllowances
      if (tokensNeedingApproval.length > 0) {
        setSufficientAllowances(false);
      } else {
        setSufficientAllowances(true);
      }
    }
  }, [tokenConfigs, tokenAllowances]);

  return { tokensToApprove, sufficientAllowances, refetchTokenAllowances };
};
