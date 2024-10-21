import { ApproveButtonManager, PermitButtonManager } from "./";
import { sepolia } from "viem/chains";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { StepsDisplay } from "~~/app/cow/_components";
import { PoolDetails } from "~~/app/v3/_components";
import { Alert, TransactionButton } from "~~/components/common";
import { useCreatePool, useInitializePool, usePoolCreationStore } from "~~/hooks/v3/";
import { bgBeigeGradient } from "~~/utils";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/";

interface PoolCreationModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

/**
 * TODO: replace sepolia hardcoded chainId by adding chainId to zustand store
 * TODO: Figure out forcing pool creation on chain that tokens are selected?
 */
export function PoolCreationModal({ setIsModalOpen }: PoolCreationModalProps) {
  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const {
    mutate: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
  } = useInitializePool();
  const { step, tokenConfigs, createPoolTxHash, initPoolTxHash } = usePoolCreationStore();

  const poolDeploymentUrl = createPoolTxHash ? getBlockExplorerTxLink(sepolia.id, createPoolTxHash) : undefined;
  const poolInitializationUrl = initPoolTxHash ? getBlockExplorerTxLink(sepolia.id, initPoolTxHash) : undefined;

  const numberOfTokens = tokenConfigs.length;

  const firstStep = {
    number: 1,
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
  };

  const approveOnTokenSteps = tokenConfigs.map((token, idx) => ({
    number: idx + 2,
    label: `Approve ${token?.tokenInfo?.symbol}`,
  }));

  const approveOnPermit2Steps = tokenConfigs.map((token, idx) => ({
    number: idx + numberOfTokens + 2,
    label: `Permit ${token?.tokenInfo?.symbol}`,
  }));

  const lastStep = {
    number: approveOnPermit2Steps.length + approveOnTokenSteps.length + 2,
    label: "Initialize Pool",
    blockExplorerUrl: poolInitializationUrl,
  };

  const poolCreationError = createPoolError || initializePoolError;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
      <div
        className="absolute w-full h-full"
        onClick={() => {
          if (isCreatePoolPending || isInitializePoolPending || step > 1) return;
          setIsModalOpen(false);
        }}
      />
      <div className="flex flex-col gap-5 relative z-10">
        <div className="bg-base-300 rounded-lg min-w-[500px] p-5 flex flex-col gap-5">
          <div className="font-bold text-2xl">Pool Creation</div>
          <PoolDetails />
          {step === 1 ? (
            <TransactionButton
              onClick={createPool}
              title="Deploy Pool"
              isDisabled={isCreatePoolPending}
              isPending={isCreatePoolPending}
            />
          ) : step > 1 && step <= approveOnTokenSteps.length + 1 ? (
            <ApproveButtonManager tokens={tokenConfigs} />
          ) : step > approveOnTokenSteps.length + 1 &&
            step <= approveOnPermit2Steps.length + approveOnTokenSteps.length + 1 ? (
            <PermitButtonManager tokens={tokenConfigs} numberOfTokens={numberOfTokens} />
          ) : step === approveOnPermit2Steps.length + approveOnTokenSteps.length + 2 ? (
            <TransactionButton
              onClick={initializePool}
              title="Initialize Pool"
              isDisabled={isInitializePoolPending}
              isPending={isInitializePoolPending}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <a href={poolDeploymentUrl} target="_blank" rel="noopener noreferrer" className="">
                <button className={`btn w-full rounded-xl text-lg ${bgBeigeGradient} text-neutral-700`}>
                  <div>View creation</div>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-1" />
                </button>
              </a>
              <a href={poolInitializationUrl} target="_blank" rel="noopener noreferrer" className="">
                <button className={`btn w-full rounded-xl text-lg ${bgBeigeGradient} text-neutral-700`}>
                  <div>View initialization</div>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-1" />
                </button>
              </a>
            </div>
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
          steps={[firstStep, ...approveOnTokenSteps, ...approveOnPermit2Steps, lastStep]}
        />
      </div>
    </div>
  );
}
