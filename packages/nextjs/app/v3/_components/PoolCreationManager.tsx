import { useState } from "react";
import { ApproveOnTokenManager } from ".";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PoolDetails } from "~~/app/v3/_components";
import { Alert, PoolStateResetModal, PoolStepsDisplay, TransactionButton } from "~~/components/common";
import {
  useCreatePool,
  useFetchBoostableTokens,
  useInitializePool,
  useMultiSwap,
  usePoolCreationStore,
} from "~~/hooks/v3/";
import { bgPrimaryGradient } from "~~/utils";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth/";

/**
 * Manages the pool creation process using a modal that cannot be closed after execution of the first step
 */
export function PoolCreationManager({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { step, tokenConfigs, clearPoolStore, updatePool, createPoolTxHash, swapTxHash, initPoolTxHash } =
    usePoolCreationStore();
  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const { mutate: multiSwap, isPending: isMultiSwapPending, error: multiSwapError } = useMultiSwap();
  const {
    mutate: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
  } = useInitializePool();

  const { standardToBoosted } = useFetchBoostableTokens();

  const chainId = tokenConfigs[0].tokenInfo?.chainId;

  const poolDeploymentUrl = createPoolTxHash ? getBlockExplorerTxLink(chainId, createPoolTxHash) : undefined;
  const poolInitializationUrl = initPoolTxHash ? getBlockExplorerTxLink(chainId, initPoolTxHash) : undefined;
  const multiSwapUrl = swapTxHash ? getBlockExplorerTxLink(chainId, swapTxHash) : undefined;

  const deployStep = createTransactionStep({
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
    onSubmit: createPool,
    isPending: isCreatePoolPending,
    error: createPoolError,
  });

  const approveOnTokenSteps = tokenConfigs.map((token, idx) => {
    const { address, amount, tokenInfo } = token;
    const { decimals, symbol } = tokenInfo || {};
    if (!symbol || !decimals) throw Error("Token symbol or decimals are undefined");

    return {
      label: `Approve ${symbol}`,
      component: <ApproveOnTokenManager key={idx} token={{ address, amount, decimals, symbol }} />,
    };
  });

  const swapToBoosted = [];
  if (tokenConfigs.some(token => token.useBoostedVariant === true)) {
    swapToBoosted.push(
      createTransactionStep({
        label: "Swap to Boosted",
        onSubmit: multiSwap,
        isPending: isMultiSwapPending,
        error: multiSwapError,
        blockExplorerUrl: multiSwapUrl,
      }),
    );
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

  const initializeStep = createTransactionStep({
    label: "Initialize Pool",
    onSubmit: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
    blockExplorerUrl: poolInitializationUrl,
  });

  const poolCreationSteps = [
    deployStep,
    ...approveOnTokenSteps,
    ...swapToBoosted,
    ...approveOnBoostedVariantSteps,
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
        <PoolStepsDisplay currentStepNumber={step} steps={poolCreationSteps} />
      </div>
      {isResetModalOpen && (
        <PoolStateResetModal
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

function createTransactionStep({
  label,
  blockExplorerUrl,
  onSubmit,
  isPending,
  error,
}: {
  label: string;
  blockExplorerUrl?: string;
  onSubmit: () => void;
  isPending: boolean;
  error: Error | null;
}) {
  return {
    label,
    blockExplorerUrl,
    component: (
      <div className="flex flex-col gap-3">
        <TransactionButton onClick={onSubmit} title={label} isDisabled={isPending} isPending={isPending} />
        {error && (
          <Alert type="error">
            <div className="flex items-center gap-2">
              Error: {(error as { shortMessage?: string }).shortMessage || error.message}
            </div>
          </Alert>
        )}
      </div>
    ),
  };
}

const PoolCreatedView = () => {
  const { poolAddress } = usePoolCreationStore();

  return (
    <div className="flex flex-col gap-5">
      <a
        href={`https://test.balancer.fi/pools/sepolia/v3/${poolAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className=""
      >
        <button className={`btn w-full rounded-xl text-lg ${bgPrimaryGradient} text-neutral-700`}>
          <div>View on Balancer</div>
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-1" />
        </button>
      </a>
      <Alert type="warning">It may take a few minutes to appear in the Balancer app</Alert>
    </div>
  );
};
