import { ApproveOnTokenManager } from ".";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { PoolDetails } from "~~/app/v3/_components";
import {
  Alert,
  ContactSupportModal,
  PoolStateResetModal,
  PoolStepsDisplay,
  TransactionButton,
} from "~~/components/common";
import {
  useBoostableWhitelist,
  useCreatePool,
  useCreatePoolTxHash,
  useInitializePool,
  useInitializePoolTxHash,
  useMultiSwap,
  usePoolCreationStore,
  useUserDataStore,
} from "~~/hooks/v3/";
import { bgBeigeGradient, bgBeigeGradientHover, bgPrimaryGradient } from "~~/utils";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

/**
 * Manages the pool creation process using a modal that cannot be closed after execution of the first step
 */
export function PoolCreationManager({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) {
  const { step, tokenConfigs, clearPoolStore, createPoolTx, swapTxHash, initPoolTx, chain } = usePoolCreationStore();
  const { clearUserData } = useUserDataStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const { isFetching: isFetchPoolAddressPending, error: fetchPoolAddressError } = useCreatePoolTxHash();

  const { mutate: multiSwap, isPending: isMultiSwapPending, error: multiSwapError } = useMultiSwap();
  const {
    mutate: initializePool,
    isPending: isInitializePoolPending,
    error: initializePoolError,
  } = useInitializePool();
  const { isFetching: isInitPoolTxHashPending, error: initPoolTxHashError } = useInitializePoolTxHash();

  const poolDeploymentUrl = createPoolTx.wagmiHash
    ? getBlockExplorerTxLink(chain?.id, createPoolTx.wagmiHash)
    : undefined;
  const poolInitializationUrl = initPoolTx.wagmiHash
    ? getBlockExplorerTxLink(chain?.id, initPoolTx.wagmiHash)
    : undefined;
  const multiSwapUrl = swapTxHash ? getBlockExplorerTxLink(chain?.id, swapTxHash) : undefined;

  const deployStep = createTransactionStep({
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
    onSubmit: createPool,
    isPending: isCreatePoolPending || isFetchPoolAddressPending,
    error: createPoolError || fetchPoolAddressError,
  });

  const approveOnTokenSteps = tokenConfigs.map((token, idx) => {
    const { address, amount, tokenInfo } = token;
    const { decimals, symbol } = tokenInfo || {};
    if (!symbol || !decimals)
      return {
        label: "Token Approval",
        component: <Alert type="error">Invalid token configuration. Missing symbol or decimals.</Alert>,
      };

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
    const boostedVariant = boostableWhitelist?.[token.address];
    if (!boostedVariant) return;
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
    isPending: isInitializePoolPending || isInitPoolTxHashPending,
    error: initializePoolError || initPoolTxHashError,
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
          if (step > 1 || isCreatePoolPending) return;
          setIsModalOpen(false);
        }}
      />
      <div className="flex flex-col gap-5">
        <div className="flex gap-5">
          <div className="flex flex-col gap-5 relative z-10">
            <div className="bg-base-300 border-neutral border rounded-lg w-[500px] p-5 flex flex-col gap-5 max-h-[90vh]">
              <div className="font-bold text-2xl text-center">Pool Creation</div>

              <div className="flex-1 min-h-0 overflow-y-auto">
                <PoolDetails />
              </div>
              {step <= poolCreationSteps.length ? poolCreationSteps[step - 1].component : <PoolCreatedView />}

              <div className="flex justify-center mt-2 gap-2 items-center">
                <ContactSupportModal />
                <div className="text-xl">·</div>
                <PoolStateResetModal
                  clearState={() => {
                    clearPoolStore();
                    clearUserData();
                    setIsModalOpen(false);
                  }}
                />
              </div>
            </div>
            {step > poolCreationSteps.length && (
              <button
                onClick={() => {
                  clearPoolStore();
                  clearUserData();
                  setIsModalOpen(false);
                }}
                className={`btn w-full rounded-xl text-lg ${bgBeigeGradient} ${bgBeigeGradientHover} text-neutral-700`}
              >
                Create another pool
              </button>
            )}
          </div>

          <div className="relative z-5">
            <PoolStepsDisplay currentStepNumber={step} steps={poolCreationSteps} />
          </div>
        </div>
      </div>
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
            <div className="flex items-center gap-2 break-words max-w-full">
              Error: {(error as { shortMessage?: string }).shortMessage || error.message}
            </div>
          </Alert>
        )}
      </div>
    ),
  };
}

const PoolCreatedView = () => {
  const { poolAddress, chain } = usePoolCreationStore();

  const baseURL = chain?.id === 11155111 ? "https://test.balancer.fi" : "https://balancer.fi";
  const poolURL = `${baseURL}/pools/${chain?.name.toLowerCase()}/v3/${poolAddress}`;

  return (
    <div className="flex flex-col gap-5">
      <a href={poolURL} target="_blank" rel="noopener noreferrer" className="">
        <button className={`btn w-full rounded-xl text-lg ${bgPrimaryGradient} text-neutral-700`}>
          <div>View on Balancer</div>
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-1" />
        </button>
      </a>
      <Alert type="success">
        Your pool has been successfully initialized and will be avaiable to view in the Balancer app shortly!
      </Alert>
    </div>
  );
};
