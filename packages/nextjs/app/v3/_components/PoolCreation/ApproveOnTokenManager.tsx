import { useEffect } from "react";
import { Address, parseUnits } from "viem";
import { Alert, TransactionButton } from "~~/components/common";
import { useApproveToken, useReadToken } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";
import { PERMIT2_ADDRESS } from "~~/utils/constants";

type MinimalToken = { address: Address; amount: string; decimals: number; symbol: string };

export const ApproveOnTokenManager = ({ token }: { token: MinimalToken }) => {
  const { step, updatePool } = usePoolCreationStore();
  const { mutateAsync: approveOnToken, isPending: isApprovePending, error: approveError } = useApproveToken({});

  const rawAmount = parseUnits(token.amount, token.decimals);
  const spender = PERMIT2_ADDRESS;
  const { allowance, refetchAllowance } = useReadToken(token.address, spender);

  const handleApprove = async () => {
    await approveOnToken(
      { token: token.address, spender, rawAmount },
      {
        onSuccess: async () => {
          await refetchAllowance();
        },
      },
    );
  };

  // auto move to next step if allowance is already enough
  useEffect(() => {
    if (allowance && allowance >= rawAmount) {
      updatePool({ step: step + 1 });
    }
  }, [allowance, rawAmount, updatePool, step]);

  return (
    <div>
      <TransactionButton
        title={`Approve ${token.symbol}`}
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
