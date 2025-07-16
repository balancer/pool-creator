import { PoolDetails } from "../PoolDetails";
import { SupportAndResetModals } from "../SupportAndResetModals";
import { ApproveOnTokenManager } from "./ApproveOnTokenManager";
import { ChooseTokenAmounts } from "./ChooseTokenAmounts";
import { PoolCreatedView } from "./PoolCreatedView";
import { Alert, PoolStepsDisplay, TransactionButton } from "~~/components/common";
import { useIsHyperEvm, useIsUsingBigBlocks, useToggleBlockSize } from "~~/hooks/hyperliquid";
import {
  useBoostableWhitelist,
  useCreatePool,
  useCreatePoolTxHash,
  useInitializePool,
  useInitializePoolTxHash,
  useMultiSwap,
  useMultiSwapTxHash,
  usePoolCreationStore,
} from "~~/hooks/v3/";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";

/**
 * Manages the pool creation process using a modal that cannot be closed after execution of the first step
 */
export function PoolCreation({ setIsModalOpen }: { setIsModalOpen: (isOpen: boolean) => void }) {
  const {
    step,
    tokenConfigs,
    createPoolTx,
    swapToBoostedTx,
    initPoolTx,
    chain,
    poolAddress,
    isChooseTokenAmountsModalOpen,
    setIsChooseTokenAmountsModalOpen,
  } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const { mutate: createPool, isPending: isCreatePoolPending, error: createPoolError } = useCreatePool();
  const { isFetching: isFetchPoolAddressPending, error: fetchPoolAddressError } = useCreatePoolTxHash();

  const { mutate: multiSwap, isPending: isMultiSwapPending, error: multiSwapError } = useMultiSwap();
  const { isFetching: isMultiSwapTxHashPending, error: multiSwapTxHashError } = useMultiSwapTxHash();

  const { mutate: initPool, isPending: isInitPoolPending, error: initPoolError } = useInitializePool();
  const { isFetching: isInitPoolTxHashPending, error: initPoolTxHashError } = useInitializePoolTxHash();

  const poolDeploymentUrl = createPoolTx.wagmiHash && getBlockExplorerTxLink(chain?.id, createPoolTx.wagmiHash);
  const multiSwapUrl = swapToBoostedTx.wagmiHash && getBlockExplorerTxLink(chain?.id, swapToBoostedTx.wagmiHash);
  const poolInitializationUrl = initPoolTx.wagmiHash && getBlockExplorerTxLink(chain?.id, initPoolTx.wagmiHash);

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

  const swapToBoostedStep = [];
  if (tokenConfigs.some(token => token.useBoostedVariant === true)) {
    swapToBoostedStep.push(
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

  const {
    mutate: toggleBlockSize,
    isPending: isToggleBlockSizePending,
    error: toggleBlockSizeError,
  } = useToggleBlockSize();

  const isHyperEvm = useIsHyperEvm();
  const { data: isUsingBigBlocks, refetch: refetchIsUsingBigBlocks } = useIsUsingBigBlocks();

  const useBigBlocksStep = {
    component: (
      <div className="flex flex-col gap-3">
        <TransactionButton
          onClick={async () => {
            toggleBlockSize();
            await refetchIsUsingBigBlocks();
          }}
          title="Use big blocks"
          isDisabled={isToggleBlockSizePending}
          isPending={isToggleBlockSizePending}
        />
        {toggleBlockSizeError ? (
          <Alert type="error">
            <div className="flex items-center gap-2 break-words max-w-full">
              Error: {(toggleBlockSizeError as { shortMessage?: string }).shortMessage || toggleBlockSizeError.message}
            </div>
          </Alert>
        ) : (
          <Alert type="warning">
            HyperEVM requires your HyperCore wallet configuration be set to use big blocks in order to deploy a contract
          </Alert>
        )}
      </div>
    ),
    label: "Use Big Blocks",
  };

  const poolCreationSteps = [
    ...(isHyperEvm && !isUsingBigBlocks ? [useBigBlocksStep] : []),
    deployStep,
    chooseAmountsStep,
    ...approveOnTokenSteps,
    ...swapToBoostedStep,
    ...approveOnBoostedVariantSteps,
    initializeStep,
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
        <div
          className="absolute w-full h-full"
          onClick={() => {
            if (createPoolTx.wagmiHash || createPoolTx.safeHash || poolAddress) return;
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

                <SupportAndResetModals callback={() => setIsModalOpen(false)} />
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
      {isChooseTokenAmountsModalOpen && <ChooseTokenAmounts />}
    </>
  );
}

interface TransactionButtonManagerProps {
  label: string;
  blockExplorerUrl?: string;
  onSubmit: () => void;
  isPending: boolean;
  error: Error | null;
}

function transactionButtonManager({
  label,
  blockExplorerUrl,
  onSubmit,
  isPending,
  error,
}: TransactionButtonManagerProps) {
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
