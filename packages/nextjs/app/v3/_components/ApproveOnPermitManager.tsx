import { useEffect } from "react";
import { BALANCER_ROUTER } from "@balancer/sdk";
import { Address, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useAllowanceOnPermit2, useApproveOnPermit2 } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

type MinimalToken = { address: Address; amount: string; decimals: number; symbol: string };

export const ApproveOnPermitManager = ({ token }: { token: MinimalToken }) => {
  const { targetNetwork } = useTargetNetwork();
  const { step, updatePool } = usePoolCreationStore();
  const publicClient = usePublicClient();
  const { mutateAsync: approveOnPermit2, isPending: isApprovePending, error: approveError } = useApproveOnPermit2();

  const { data: allowanceData } = useAllowanceOnPermit2(token.address);

  const spender = BALANCER_ROUTER[targetNetwork.id];
  const rawAmount = parseUnits(token.amount, token.decimals);

  const handleApprove = async () => {
    await approveOnPermit2(
      { token: token.address, spender },
      {
        onSuccess: () => {
          updatePool({ step: step + 1 });
        },
      },
    );
  };

  // auto move to next step if allowance is already enough
  useEffect(() => {
    async function checkAllowance() {
      if (!allowanceData) return;
      if (!publicClient) return;
      const [amount, expiration] = allowanceData;
      const block = await publicClient.getBlock();
      const currentTimestamp = Number(block.timestamp);

      if (amount >= rawAmount && expiration > currentTimestamp) {
        updatePool({ step: step + 1 });
      }
    }

    checkAllowance();
  }, [allowanceData, token, step, updatePool, rawAmount, publicClient]);

  return (
    <div>
      <TransactionButton
        title={`Permit ${token.symbol}`}
        isDisabled={isApprovePending}
        isPending={isApprovePending}
        onClick={handleApprove}
      />
      {approveError && (
        <div className="max-w-[500px] mt-4">
          <Alert type="error">{approveError.message}</Alert>
        </div>
      )}
    </div>
  );
};
