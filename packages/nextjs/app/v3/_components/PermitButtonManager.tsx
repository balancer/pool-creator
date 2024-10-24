import { useEffect } from "react";
import { BALANCER_ROUTER } from "@balancer/sdk";
import { parseUnits } from "viem";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useAllowanceOnPermit2, useApproveOnPermit2 } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";
import { type TokenConfig } from "~~/hooks/v3";

export const PermitButtonManager = ({ token }: { token: TokenConfig }) => {
  const { targetNetwork } = useTargetNetwork();
  const { step, updatePool } = usePoolCreationStore();
  const { mutateAsync: approveOnPermit2, isPending: isApprovePending, error: approveError } = useApproveOnPermit2();
  if (!token.tokenInfo) throw Error("Token decimals are undefined");

  const { data: allowanceData } = useAllowanceOnPermit2(token.address);

  const spender = BALANCER_ROUTER[targetNetwork.id];
  const rawAmount = parseUnits(token.amount, token.tokenInfo.decimals);

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
    if (allowanceData) {
      const [amount, expiration] = allowanceData;
      // TODO: make sure this is okay? maybe read block.timestamp instead?
      const currentTimestamp = Math.floor(Date.now() / 1000);

      // If allowance is sufficient and not expired, move to next step
      if (amount >= rawAmount && expiration > currentTimestamp) {
        updatePool({ step: step + 1 });
      }
    }
  }, [allowanceData, token, step, updatePool, rawAmount]);

  return (
    <div>
      <TransactionButton
        title={`Permit ${token?.tokenInfo?.symbol}`}
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
