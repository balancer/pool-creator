import { useState } from "react";
import { ApproveButtonManager, PermitButtonManager } from "./";
import { sepolia } from "viem/chains";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PoolResetModal, StepsDisplay } from "~~/app/cow/_components";
import { PoolDetails } from "~~/app/v3/_components";
import { Alert, TransactionButton } from "~~/components/common";
import {
  useBatchSwap,
  useCreatePool,
  useFetchBoostableTokens,
  useInitializePool,
  usePoolCreationStore,
} from "~~/hooks/v3/";
import { bgBeigeGradient } from "~~/utils";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/";

interface PoolCreationModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function PoolCreationModal({ setIsModalOpen }: PoolCreationModalProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { step, tokenConfigs, clearPoolStore, updatePool, createPoolTxHash, initPoolTxHash } = usePoolCreationStore();

  const { standardToBoosted } = useFetchBoostableTokens();

  const poolDeploymentUrl = createPoolTxHash ? getBlockExplorerTxLink(sepolia.id, createPoolTxHash) : undefined;
  const poolInitializationUrl = initPoolTxHash ? getBlockExplorerTxLink(sepolia.id, initPoolTxHash) : undefined;

  const deployStep = {
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
    component: <DeployPool key="deploy" />,
  };

  const approveOnSelectedTokenSteps = tokenConfigs.map((token, idx) => {
    const { address, amount, tokenInfo } = token;
    const { decimals, symbol } = tokenInfo || {};
    if (!symbol || !decimals) throw Error("Token symbol or decimals are undefined");

    return {
      label: `Approve ${symbol}`,
      component: <ApproveButtonManager key={idx} token={{ address, amount, decimals, symbol }} />,
    };
  });

  const swapIntoBoostedStep = [];
  if (tokenConfigs.some(token => token.useBoostedVariant === true)) {
    swapIntoBoostedStep.push({ label: "Swap Tokens", component: <SwapTokens /> });
  }

  const approveOnBoostedVariantSteps: { label: string; component: React.ReactNode }[] = [];
  const boostedVariants = tokenConfigs.filter(token => token.useBoostedVariant);
  boostedVariants.forEach((token, idx) => {
    const { amount } = token;
    const boostedVariant = standardToBoosted[token.address];
    approveOnBoostedVariantSteps.push({
      label: `Approve ${boostedVariant.symbol}`,
      component: (
        <ApproveButtonManager
          key={idx}
          token={{
            address: boostedVariant.address,
            amount,
            decimals: boostedVariant.decimals,
            symbol: boostedVariant.symbol,
          }}
        />
      ),
    });
  });

  // TODO change permitManager to handle if boosted variant is used
  const approveOnPermit2Steps = tokenConfigs.map((token, idx) => {
    const boostedVariant = standardToBoosted[token.address];
    return {
      label: `Permit ${boostedVariant ? boostedVariant.symbol : token?.tokenInfo?.symbol}`,
      component: <PermitButtonManager key={idx} token={token} />,
    };
  });

  const initializeStep = {
    label: "Initialize Pool",
    blockExplorerUrl: poolInitializationUrl,
    component: <InitializePool key="initialize" />,
  };

  const poolCreationSteps = [
    deployStep,
    ...approveOnSelectedTokenSteps,
    ...swapIntoBoostedStep,
    ...approveOnBoostedVariantSteps,
    ...approveOnPermit2Steps,
    initializeStep,
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
      <div
        className="absolute w-full h-full"
        onClick={() => {
          if (step > 1) return;
          setIsModalOpen(false);
        }}
      />
      <div className="flex flex-col gap-5 relative z-10">
        <div className="bg-base-300 rounded-lg min-w-[500px] p-5 flex flex-col gap-5">
          <div className="font-bold text-2xl text-center">Pool Creation</div>
          <PoolDetails />
          {step <= poolCreationSteps.length ? poolCreationSteps[step - 1].component : <PoolCreatedView />}
        </div>
        <div className="flex justify-center">
          <div onClick={() => setIsResetModalOpen(true)} className="text-center underline cursor-pointer text-lg mt-2">
            Reset progress
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <StepsDisplay currentStepNumber={step} steps={poolCreationSteps} />
      </div>
      {isResetModalOpen && (
        <PoolResetModal
          clearState={() => {
            clearPoolStore();
            setIsModalOpen(false);
            updatePool({ selectedTab: "Type" });
          }}
          setIsModalOpen={setIsResetModalOpen}
        />
      )}
    </div>
  );
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

const SwapTokens = () => {
  const { mutate: batchSwap, isPending: isBatchSwapPending, error: batchSwapError } = useBatchSwap();

  return (
    <div>
      <TransactionButton
        key="initialize"
        onClick={batchSwap}
        title="Initialize Pool"
        isDisabled={isBatchSwapPending}
        isPending={isBatchSwapPending}
      />

      {batchSwapError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            Error: {(batchSwapError as { shortMessage?: string }).shortMessage || batchSwapError.message}
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
