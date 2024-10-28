import { useState } from "react";
import { ApproveOnPermitManager, ApproveOnTokenManager } from "./";
import { sepolia } from "viem/chains";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PoolResetModal, StepsDisplay } from "~~/app/cow/_components";
import { PoolDetails } from "~~/app/v3/_components";
import { Alert, TransactionButton } from "~~/components/common";
import {
  useCreatePool,
  useFetchBoostableTokens,
  useInitializePool,
  useMultiSwap,
  usePoolCreationStore,
} from "~~/hooks/v3/";
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
      component: <ApproveOnTokenManager key={idx} token={{ address, amount, decimals, symbol }} />,
    };
  });

  const swapIntoBoostedStep = [];
  if (tokenConfigs.some(token => token.useBoostedVariant === true)) {
    swapIntoBoostedStep.push({ label: "Multi Swap Tokens", component: <SwapTokens /> });
  }

  const approveOnBoostedVariantSteps: { label: string; component: React.ReactNode }[] = [];
  const boostedVariants = tokenConfigs.filter(token => token.useBoostedVariant);
  boostedVariants.forEach((token, idx) => {
    const { amount } = token;
    const boostedVariant = standardToBoosted[token.address];
    approveOnBoostedVariantSteps.push({
      label: `Approve ${boostedVariant.symbol}`,
      component: (
        <ApproveOnTokenManager
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

  const approveOnPermit2Steps = tokenConfigs.map((token, idx) => {
    const { useBoostedVariant } = token;
    const boostedVariant = standardToBoosted[token.address];

    const address = useBoostedVariant ? boostedVariant.address : token.address;
    const decimals = useBoostedVariant ? boostedVariant.decimals : token.tokenInfo?.decimals;
    const symbol = useBoostedVariant ? boostedVariant.symbol : token.tokenInfo?.symbol;
    const amount = token.amount;
    if (!symbol || !decimals) throw Error("Token symbol or decimals are undefined");

    return {
      label: `Permit ${symbol}`,
      component: <ApproveOnPermitManager key={idx} token={{ address, amount, decimals, symbol }} />,
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
  const { mutate: multiSwap, isPending: isMultiSwapPending, error: multiSwapError } = useMultiSwap();

  return (
    <div>
      <TransactionButton
        key="multi-swap"
        onClick={multiSwap}
        title="Multi Swap"
        isDisabled={isMultiSwapPending}
        isPending={isMultiSwapPending}
      />

      {multiSwapError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            Error: {(multiSwapError as { shortMessage?: string }).shortMessage || multiSwapError.message}
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

// TODO figure out how to link to the newly created pool on Balancer frontend
const PoolCreatedView = () => {
  const { poolAddress } = usePoolCreationStore();

  return (
    <div className="">
      <a
        href={`https://test.balancer.fi/pools/sepolia/v3/${poolAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className=""
      >
        <button className={`btn w-full rounded-xl text-lg btn-accent text-neutral-700`}>
          <div>View on Balancer</div>
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-1" />
        </button>
      </a>
    </div>
  );
};
