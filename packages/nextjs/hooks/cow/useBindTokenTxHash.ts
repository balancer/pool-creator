import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { usePublicClient } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

interface UseBindTokenTxHashProps {
  tokenNumber: 1 | 2;
}

export function useBindTokenTxHash({ tokenNumber }: UseBindTokenTxHashProps) {
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const isSafeWallet = useIsSafeWallet();

  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const txKey = `bindToken${tokenNumber}Tx` as const;
  const { safeHash, wagmiHash, isSuccess } = poolCreation?.[txKey] || {};

  return useQuery({
    queryKey: [`approveToken${tokenNumber}TxHash`, safeHash, wagmiHash, isSuccess],
    queryFn: async () => {
      if (!publicClient) throw new Error("No public client for fetching pool address");

      if (isSafeWallet && safeHash && !wagmiHash) {
        const hash = await pollSafeTxStatus(sdk, safeHash);
        updatePoolCreation({ [txKey]: { safeHash, wagmiHash: hash, isSuccess: false } });
        return null;
      }

      if (!wagmiHash) return null;

      const txReceipt = await publicClient.waitForTransactionReceipt({ hash: wagmiHash });

      if (txReceipt.status === "success") {
        if (!poolCreation?.step) throw new Error("Missing pool creation step");

        updatePoolCreation({
          [txKey]: { safeHash, wagmiHash, isSuccess: true },
          step: poolCreation.step + 1,
        });
      } else {
        throw new Error("Approve token transaction reverted");
      }
    },
    enabled: Boolean(!isSuccess && (safeHash || wagmiHash)),
  });
}
