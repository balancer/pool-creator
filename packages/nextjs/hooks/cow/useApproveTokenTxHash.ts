import { erc20Abi } from "@balancer/sdk";
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
import { useQuery } from "@tanstack/react-query";
import { parseEventLogs, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe/useIsSafeWallet";
import { pollSafeTxStatus } from "~~/utils/safe";

interface UseApproveTokenTxHashProps {
  tokenNumber: 1 | 2;
}

export function useApproveTokenTxHash({ tokenNumber }: UseApproveTokenTxHashProps) {
  const publicClient = usePublicClient();
  const { sdk } = useSafeAppsSDK();
  const isSafeWallet = useIsSafeWallet();

  const { poolCreation, updatePoolCreation } = usePoolCreationStore();
  const txKey = `approveToken${tokenNumber}Tx` as const;
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
        const amount = poolCreation?.[`token${tokenNumber}Amount`];
        const decimals = poolCreation?.[`token${tokenNumber}`].decimals;
        if (!amount || !decimals) throw new Error(`Missing info for token ${tokenNumber}`);

        const rawAmount = parseUnits(amount, decimals);
        const logs = parseEventLogs({
          abi: erc20Abi,
          logs: txReceipt.logs,
        });

        const approvalEvent = logs.find(log => log.eventName === "Approval");
        if (!approvalEvent) throw new Error("No Approval event found in logs");

        const newAllowance = approvalEvent.args.value;
        if (newAllowance < rawAmount) throw new Error(`Approval amount for token ${tokenNumber} is less than required`);

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
