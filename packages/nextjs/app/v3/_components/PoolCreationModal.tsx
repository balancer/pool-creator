import { BALANCER_ROUTER, PERMIT2 } from "@balancer/sdk";
import { parseUnits } from "viem";
import { StepsDisplay } from "~~/app/cow/_components";
import { PoolDetails } from "~~/app/v3/_components";
import { Alert, TransactionButton } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useApproveOnPermit2, useApproveToken, useReadToken } from "~~/hooks/token";
import { type TokenConfig, useCreatePool, useInitializePool, usePoolCreationStore } from "~~/hooks/v3/";

interface PoolCreationModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function PoolCreationModal({ setIsModalOpen }: PoolCreationModalProps) {
  const { mutateAsync: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const {
    mutateAsync: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
  } = useInitializePool();
  const { step, tokenConfigs, poolAddress, updatePool } = usePoolCreationStore();

  const numberOfTokens = tokenConfigs.length;

  const approveOnTokenSteps = tokenConfigs.map((token, idx) => ({
    number: idx + 2,
    label: `Approve ${token?.tokenInfo?.symbol}`,
  }));

  const approveOnPermit2Steps = tokenConfigs.map((token, idx) => ({
    number: idx + numberOfTokens + 2,
    label: `Permit ${token?.tokenInfo?.symbol}`,
  }));

  const poolCreationError = createPoolError || initializePoolError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="flex flex-col gap-5 relative z-10">
        <div className="bg-base-300 rounded-lg min-w-[500px] p-5 flex flex-col gap-5">
          <div className="font-bold text-2xl">Pool Creation</div>
          <PoolDetails />
          {step === 1 ? (
            <TransactionButton
              onClick={async () => {
                await createPool(undefined, {
                  onSuccess: txHash => {
                    updatePool({ step: 2, createPoolTxHash: txHash });
                  },
                });
              }}
              title="Deploy Pool"
              isDisabled={isCreatePoolPending}
              isPending={isCreatePoolPending}
            />
          ) : step > 1 && step <= approveOnTokenSteps.length + 1 ? (
            <ApproveButtons tokens={tokenConfigs} />
          ) : step > approveOnTokenSteps.length + 1 &&
            step <= approveOnPermit2Steps.length + approveOnTokenSteps.length + 1 ? (
            <PermitButtons tokens={tokenConfigs} numberOfTokens={numberOfTokens} />
          ) : step === approveOnPermit2Steps.length + approveOnTokenSteps.length + 2 ? (
            <TransactionButton
              onClick={async () => {
                await initializePool(undefined, {
                  onSuccess: txHash => {
                    console.log("initalize onSuccess fired!");
                    updatePool({ step: step + 1, initPoolTxHash: txHash });
                  },
                });
              }}
              title="Initialize Pool"
              isDisabled={isInitializePoolPending}
              isPending={isInitializePoolPending}
            />
          ) : (
            <Alert type="success">Pool initialized: {poolAddress}</Alert>
          )}
        </div>
        {poolCreationError && (
          <Alert type="error">
            <div className="flex items-center gap-2">
              Error: {(poolCreationError as { shortMessage?: string }).shortMessage || poolCreationError.message}
            </div>
          </Alert>
        )}
      </div>

      <div className="relative z-10">
        <StepsDisplay
          currentStepNumber={step}
          steps={[
            { number: 1, label: "Deploy Pool" },
            ...approveOnTokenSteps,
            ...approveOnPermit2Steps,
            { number: approveOnPermit2Steps.length + approveOnTokenSteps.length + 2, label: "Initialize Pool" },
          ]}
        />
      </div>
    </div>
  );
}

/**
 * TODO: write logic to determine which tokens still need approval based on allowances
 */
const ApproveButtons = ({ tokens }: { tokens: TokenConfig[] }) => {
  const { targetNetwork } = useTargetNetwork();
  const { step, updatePool } = usePoolCreationStore();
  const { mutateAsync: approve, isPending: isApprovePending, error: approveError } = useApproveToken();

  const token = tokens[step - 2]; // step value starts at 2 so start from index 0
  const rawAmount = parseUnits(token.amount, token?.tokenInfo?.decimals ?? 18);
  const spender = PERMIT2[targetNetwork.id];
  const { refetchAllowance } = useReadToken(token.address, spender);

  const handleApprove = async () => {
    await approve(
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

const PermitButtons = ({ tokens, numberOfTokens }: { tokens: TokenConfig[]; numberOfTokens: number }) => {
  const { targetNetwork } = useTargetNetwork();
  const { step, updatePool } = usePoolCreationStore();
  const { mutateAsync: approve, isPending: isApprovePending, error: approveError } = useApproveOnPermit2();

  const token = tokens[step - 2 - numberOfTokens]; // :(
  const spender = BALANCER_ROUTER[targetNetwork.id];

  const handleApprove = async () => {
    await approve(
      { token: token.address, spender },
      {
        onSuccess: () => {
          updatePool({ step: step + 1 });
        },
      },
    );
  };

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
