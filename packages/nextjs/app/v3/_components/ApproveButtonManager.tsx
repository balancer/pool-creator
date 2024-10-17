import { useEffect } from "react";
import { PERMIT2 } from "@balancer/sdk";
import { parseUnits } from "viem";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useApproveToken, useReadToken } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";
import { type TokenConfig } from "~~/hooks/v3";

export const ApproveButtonManager = ({ tokens }: { tokens: TokenConfig[] }) => {
  const { targetNetwork } = useTargetNetwork();
  const { step, updatePool } = usePoolCreationStore();
  const { mutateAsync: approveOnToken, isPending: isApprovePending, error: approveError } = useApproveToken();

  const token = tokens[step - 2]; // step value starts at 2 so start from index 0
  const rawAmount = parseUnits(token.amount, token?.tokenInfo?.decimals ?? 18);
  const spender = PERMIT2[targetNetwork.id];
  const { allowance, refetchAllowance } = useReadToken(token.address, spender);

  const handleApprove = async () => {
    await approveOnToken(
      { token: token.address, spender, rawAmount },
      {
        onSuccess: async () => {
          const { data: allowance } = await refetchAllowance();
          if (allowance && allowance >= rawAmount) {
            updatePool({ step: step + 1 });
          }
        },
      },
    );
  };

  // auto move to next step if allowance is already enough
  useEffect(() => {
    // TODO: test this with wallet that has already max approved permit2 for some tokens
    if (allowance && allowance >= rawAmount) {
      updatePool({ step: step + 1 });
    }
  }, [allowance, rawAmount, updatePool, step]);

  return (
    <div>
      <TransactionButton
        title={`Approve ${token?.tokenInfo?.symbol}`}
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
