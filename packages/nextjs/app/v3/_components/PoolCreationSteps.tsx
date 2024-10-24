import { ApproveButtonManager, PermitButtonManager } from "./";
import { sepolia } from "viem/chains";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { TransactionButton } from "~~/components/common";
import { Alert } from "~~/components/common";
import { useCreatePool, useInitializePool, usePoolCreationStore } from "~~/hooks/v3/";
import { bgBeigeGradient } from "~~/utils";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/";

export function PoolCreationSteps() {
  const { tokenConfigs, step } = usePoolCreationStore();

  const steps: React.ReactNode[] = [
    <DeployPool key="deploy" />,
    ...tokenConfigs.map((token, index) => <ApproveButtonManager key={index} token={token} />),
    ...tokenConfigs.map((token, index) => <PermitButtonManager key={index} token={token} />),
    <InitializePool key="initialize" />,
    <PoolCreatedView key="complete" />,
  ];

  return steps[step - 1];
}

const DeployPool = () => {
  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  return (
    <div>
      <TransactionButton
        onClick={createPool}
        title="Deploy Pool"
        isDisabled={isCreatePoolPending}
        isPending={isCreatePoolPending}
      />
      {createPoolError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            Error: {(createPoolError as { shortMessage?: string }).shortMessage || createPoolError.message}
          </div>
        </Alert>
      )}
    </div>
  );
};

const InitializePool = () => {
  const {
    mutate: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
  } = useInitializePool();

  return (
    <div>
      <TransactionButton
        key="initialize"
        onClick={initializePool}
        title="Initialize Pool"
        isDisabled={isInitializePoolPending}
        isPending={isInitializePoolPending}
      />

      {initializePoolError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            Error: {(initializePoolError as { shortMessage?: string }).shortMessage || initializePoolError.message}
          </div>
        </Alert>
      )}
    </div>
  );
};

const PoolCreatedView = () => {
  const { createPoolTxHash, initPoolTxHash } = usePoolCreationStore();

  const poolDeploymentUrl = createPoolTxHash ? getBlockExplorerTxLink(sepolia.id, createPoolTxHash) : undefined;
  const poolInitializationUrl = initPoolTxHash ? getBlockExplorerTxLink(sepolia.id, initPoolTxHash) : undefined;

  return (
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
  );
};
