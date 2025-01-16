import { vaultV3Abi } from "@balancer/sdk";
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { formatUnits, parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3/";
import { pollSafeTxStatus } from "~~/utils/safe";

/**
 * Use multi swap tx hash to parse amounts after underlying tokens are swapped to boosted variants
 * Also moves step progression forward
 */
export function useMultiSwapTxHash() {
  const publicClient = usePublicClient();
  const isSafeWallet = useIsSafeWallet();
  const { sdk } = useSafeAppsSDK();

  const { swapToBoostedTx, updatePool, poolType, tokenConfigs, updateTokenConfig, step } = usePoolCreationStore();
  const { wagmiHash, safeHash } = swapToBoostedTx;

  const { data: boostableWhitelist } = useBoostableWhitelist();

  return useQuery({
    queryKey: ["multiSwapTx", wagmiHash, safeHash],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");
      if (poolType === undefined) throw new Error("Pool type is undefined");

      if (isSafeWallet && safeHash && !wagmiHash) {
        console.log("beginning poll for swap to boosted safe hash:", safeHash);
        const wagmiHash = await pollSafeTxStatus(sdk, safeHash);
        updatePool({ swapToBoostedTx: { safeHash, wagmiHash, isSuccess: false } });
        return null; // Trigger a re-query with the new wagmiHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        const logs = parseEventLogs({
          abi: vaultV3Abi,
          eventName: "Wrap",
          logs: txReceipt.logs,
        });

        logs.forEach(log => {
          // mintedShares is the amount, underlyingToken is an address
          const { mintedShares, wrappedToken } = log.args;
          console.log("wrappedToken", wrappedToken);
          const boostedToken = Object.values(boostableWhitelist ?? {}).find(
            token => token.address.toLowerCase() === wrappedToken.toLowerCase(),
          );
          if (!boostedToken) throw new Error("Boosted token not found");
          console.log("boostedToken", boostedToken);
          const amount = formatUnits(mintedShares, boostedToken?.decimals);
          // find corresponding token index for tokenConfigs array
          const tokenIndex = tokenConfigs.findIndex(
            token => token.address.toLowerCase() === boostedToken?.underlyingTokenAddress?.toLowerCase(),
          );
          if (tokenIndex === -1) throw new Error("Token index not matched in swap to boosted tx hash");

          console.log("amount", amount, "tokenIndex", tokenIndex);
          updateTokenConfig(tokenIndex, { amount });
        });

        updatePool({ step: step + 1, swapToBoostedTx: { wagmiHash, safeHash, isSuccess: true } });
        return { isSuccess: true };
      } else {
        throw new Error("Swap to boosted variant transaction reverted");
      }
    },
    enabled: Boolean(!swapToBoostedTx.isSuccess && (safeHash || wagmiHash)),
  });
}
