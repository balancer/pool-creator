import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

export function useSetSwapFeeTxHash() {
  const isSafeWallet = useIsSafeWallet();
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const { setSwapFeeTx } = poolCreation || {};
  const { safeHash, wagmiHash, isSuccess } = setSwapFeeTx || {};

  return useQuery({
    queryKey: ["setSwapFeeTxHash", safeHash, wagmiHash, isSuccess],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");

      // If safe wallet, poll for safe tx status to update createPoolTxHash
      if (isSafeWallet && safeHash && !wagmiHash) {
        const hash = await pollSafeTxStatus(sdk, safeHash);
        updatePoolCreation({ setSwapFeeTx: { safeHash, wagmiHash: hash, isSuccess: false } });
        return null; // Trigger a re-query with the new createPoolTxHash
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        if (!poolCreation?.step) throw new Error("Missing pool creation step");
        if (!poolCreation?.poolAddress) throw new Error("Missing pool address");

        const MAX_FEE = await publicClient.readContract({
          abi: abis.CoW.BCoWPool,
          address: poolCreation?.poolAddress,
          functionName: "MAX_FEE",
        });

        const swapFee = await publicClient.readContract({
          abi: abis.CoW.BCoWPool,
          address: poolCreation?.poolAddress,
          functionName: "getSwapFee",
        });

        if (swapFee !== MAX_FEE) throw new Error("Swap fee is not set to max fee");

        updatePoolCreation({ setSwapFeeTx: { safeHash, wagmiHash, isSuccess: true }, step: poolCreation?.step + 1 });
        return { isSuccess: true };
      } else {
        throw new Error("Set swap fee transaction reverted");
      }
    },
    enabled: Boolean(!isSuccess && (safeHash || wagmiHash)),
  });
}
