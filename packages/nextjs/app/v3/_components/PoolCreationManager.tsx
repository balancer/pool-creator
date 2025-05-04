import { useState } from "react";
import { ApproveOnTokenManager, PoolCreatedView } from ".";
import { ChooseTokenAmounts, PoolDetails } from "~~/app/v3/_components";
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
  useMultiSwapTxHash,
  usePoolCreationStore,
  useUserDataStore,
} from "~~/hooks/v3/";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

/**
 * Manages the pool creation process using a modal that cannot be closed after execution of the first step
 */
export function PoolCreationManager({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) {
  const [isChooseTokenAmountsModalOpen, setIsChooseTokenAmountsModalOpen] = useState(false);

  const { step, tokenConfigs, clearPoolStore, createPoolTx, swapToBoostedTx, initPoolTx, chain } =
    usePoolCreationStore();
  const { clearUserData } = useUserDataStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const { isFetching: isFetchPoolAddressPending, error: fetchPoolAddressError } = useCreatePoolTxHash();

  const { mutate: multiSwap, isPending: isMultiSwapPending, error: multiSwapError } = useMultiSwap();
  const { isFetching: isMultiSwapTxHashPending, error: multiSwapTxHashError } = useMultiSwapTxHash();

  const { mutate: initPool, isPending: isInitPoolPending, error: initPoolError } = useInitializePool();
  const { isFetching: isInitPoolTxHashPending, error: initPoolTxHashError } = useInitializePoolTxHash();

  const poolDeploymentUrl = createPoolTx.wagmiHash
    ? getBlockExplorerTxLink(chain?.id, createPoolTx.wagmiHash)
    : undefined;
  const multiSwapUrl = swapToBoostedTx.wagmiHash
    ? getBlockExplorerTxLink(chain?.id, swapToBoostedTx.wagmiHash)
    : undefined;
  const poolInitializationUrl = initPoolTx.wagmiHash
    ? getBlockExplorerTxLink(chain?.id, initPoolTx.wagmiHash)
    : undefined;

  const deployStep = transactionButtonManager({
    label: "Deploy Pool",
    blockExplorerUrl: poolDeploymentUrl,
    onSubmit: createPool,
    isPending: isCreatePoolPending || isFetchPoolAddressPending,
    error: createPoolError || fetchPoolAddressError,
  });

  const chooseAmountsStep = {
    label: "Choose Amounts",
    component: (
      <TransactionButton
        onClick={() => setIsChooseTokenAmountsModalOpen(true)}
        title="Choose Token Amounts"
        isDisabled={false}
        isPending={false}
      />
    ),
  };

  const approveOnTokenSteps = tokenConfigs.map((token, idx) => {
    const { address, amount, tokenInfo } = token;
    const { decimals, symbol } = tokenInfo || {};
    if (!symbol || !decimals)
      return {
        label: "Token Approval",
        component: <Alert type="error">Missing token info!</Alert>,
      };

    return {
      label: `Approve ${symbol}`,
      component: <ApproveOnTokenManager key={idx} token={{ address, amount, decimals, symbol }} />,
    };
  });

  const swapToBoosted = [];
  if (tokenConfigs.some(token => token.useBoostedVariant === true)) {
    swapToBoosted.push(
      transactionButtonManager({
        label: "Swap to Boosted",
        onSubmit: multiSwap,
        isPending: isMultiSwapPending || isMultiSwapTxHashPending,
        error: multiSwapError || multiSwapTxHashError,
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

  const initializeStep = transactionButtonManager({
    label: "Initialize Pool",
    onSubmit: initPool,
    isPending: isInitPoolPending || isInitPoolTxHashPending,
    error: initPoolError || initPoolTxHashError,
    blockExplorerUrl: poolInitializationUrl,
  });

  const poolCreationSteps = [
    deployStep,
    chooseAmountsStep,
    ...approveOnTokenSteps,
    ...swapToBoosted,
    ...approveOnBoostedVariantSteps,
    initializeStep,
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
        <div
          className="absolute w-full h-full"
          onClick={() => {
            if (initPoolTx.wagmiHash || initPoolTx.safeHash) return; // don't let user close modal to try to edit amounts after init tx has been sent
            setIsModalOpen(false);
          }}
        />
        <div className="flex flex-col gap-5">
          <div className="flex gap-5">
            <div className="flex flex-col gap-5 relative z-10 w-[500px]">
              <div className="bg-base-300 border-neutral border rounded-lg  p-5 flex flex-col gap-5 max-h-[90vh]">
                <div className="font-bold text-2xl text-center">Pool Creation</div>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <PoolDetails />
                </div>

                {step <= poolCreationSteps.length ? (
                  poolCreationSteps[step - 1].component
                ) : (
                  <PoolCreatedView setIsModalOpen={setIsModalOpen} />
                )}

                <div className="flex justify-center gap-2 items-center">
                  <ContactSupportModal />
                  <div className="text-xl">·</div>
                  <PoolStateResetModal
                    clearState={() => {
                      clearPoolStore();
                      clearUserData();
                      setIsModalOpen(false);
                    }}
                    trigger={<span className="hover:underline">Reset Progress</span>}
                  />
                </div>
              </div>
              {step > poolCreationSteps.length && (
                <Alert type="success">
                  Your pool has been successfully initialized and will be available to view in the Balancer app shortly!
                </Alert>
              )}
            </div>

            <div className="relative z-5">
              <PoolStepsDisplay currentStepNumber={step} steps={poolCreationSteps} />
            </div>
          </div>
        </div>
      </div>
      {isChooseTokenAmountsModalOpen && (
        <ChooseTokenAmounts setIsChooseTokenAmountsModalOpen={setIsChooseTokenAmountsModalOpen} />
      )}
    </>
  );
}

export function transactionButtonManager({
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
