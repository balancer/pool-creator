import { useEffect } from "react";
import { PoolCreated } from "./";
import { parseUnits } from "viem";
import { useSwitchChain } from "wagmi";
import {
  Alert,
  ContactSupportModal,
  PoolStateResetModal,
  PoolStepsDisplay,
  TextField,
  TokenField,
  TransactionButton,
} from "~~/components/common/";
import { CHAIN_NAMES } from "~~/hooks/balancer/";
import {
  type PoolCreationState,
  useBindToken,
  useCreatePool,
  useFetchPoolAddress,
  useFinalizePool,
  useReadPool,
  useSetSwapFee,
} from "~~/hooks/cow/";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useApproveToken, useReadToken } from "~~/hooks/token";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";
import { getBlockExplorerTxLink } from "~~/utils/scaffold-eth";
import { getPerTokenWeights } from "~~/utils/token-weights";

interface ManagePoolCreationProps {
  poolCreation: PoolCreationState;
  updatePoolCreation: (updates: Partial<PoolCreationState>) => void;
  clearPoolCreation: () => void;
}

export const PoolCreation = ({ poolCreation, updatePoolCreation, clearPoolCreation }: ManagePoolCreationProps) => {
  const {
    poolAddress,
    createPoolTxHash,
    approveToken1TxHash,
    approveToken2TxHash,
    bindToken1TxHash,
    bindToken2TxHash,
    setSwapFeeTxHash,
    finalizePoolTxHash,
  } = poolCreation;

  const { isFetching: isFetchPoolAddressPending, error: fetchPoolAddressError } = useFetchPoolAddress();

  const token1RawAmount = parseUnits(poolCreation.token1Amount, poolCreation.token1.decimals);
  const token2RawAmount = parseUnits(poolCreation.token2Amount, poolCreation.token2.decimals);
  const { token1Weight, token2Weight } = getPerTokenWeights(poolCreation.tokenWeights);

  const { targetNetwork } = useTargetNetwork();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = targetNetwork.id !== poolCreation.chainId;

  const { data: poolData, refetch: refetchPool } = useReadPool(poolAddress);
  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(
    poolCreation.token1.address,
    poolAddress,
  );
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(
    poolCreation.token2.address,
    poolAddress,
  );
  const { mutate: createPool, isPending: isCreatePending, error: createPoolError } = useCreatePool();
  const { mutate: approve1, isPending: isApprove1Pending, error: approve1Error } = useApproveToken();
  const { mutate: approve2, isPending: isApprove2Pending, error: approve2Error } = useApproveToken();
  const { mutate: bind1, isPending: isBind1Pending, error: bind1Error } = useBindToken(poolCreation.tokenWeights, true);
  const {
    mutate: bind2,
    isPending: isBind2Pending,
    error: bind2Error,
  } = useBindToken(poolCreation.tokenWeights, false);
  const { mutate: setSwapFee, isPending: isSetSwapFeePending, error: setSwapFeeError } = useSetSwapFee();
  const { mutate: finalizePool, isPending: isFinalizePending, error: finalizeError } = useFinalizePool();

  const txError =
    createPoolError ||
    fetchPoolAddressError ||
    approve1Error ||
    approve2Error ||
    bind1Error ||
    bind2Error ||
    setSwapFeeError ||
    finalizeError;

  useEffect(() => {
    if (!poolData || !poolAddress) return;

    if (poolData.isFinalized) {
      updatePoolCreation({ step: 8 });
      return;
    }

    switch (poolData.numTokens) {
      case 0n:
        if (allowance1 < token1RawAmount) {
          updatePoolCreation({ step: 2 });
        } else if (allowance2 < token2RawAmount) {
          updatePoolCreation({ step: 3 });
        } else if (allowance1 >= token1RawAmount && allowance2 >= token2RawAmount) {
          updatePoolCreation({ step: 4 });
        }
        break;

      case 1n:
        updatePoolCreation({ step: 5 });
        break;

      case 2n:
        if (poolData.swapFee !== poolData.MAX_FEE) {
          updatePoolCreation({ step: 6 });
        } else {
          updatePoolCreation({ step: 7 });
        }
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData, allowance1, allowance2, token1RawAmount, token2RawAmount]);

  const etherscanURL = poolData && getBlockExplorerAddressLink(targetNetwork, poolData.address);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-5 ">
        <div className="flex flex-col gap-5">
          <div className="bg-base-200 p-6 rounded-xl shadow-xl w-[555px]">
            <div className="flex flex-col items-center gap-5 w-full min-w-[333px]">
              <h5 className="text-xl md:text-2xl font-bold text-center">Preview your pool</h5>
              <div className="w-full">
                <div className="ml-1 mb-1">Selected pool tokens:</div>
                <div className="w-full flex flex-col gap-3">
                  <TokenField
                    value={poolCreation.token1Amount}
                    selectedToken={poolCreation.token1}
                    isDisabled={true}
                    tokenWeight={token1Weight}
                  />
                  <TokenField
                    value={poolCreation.token2Amount}
                    selectedToken={poolCreation.token2}
                    isDisabled={true}
                    tokenWeight={token2Weight}
                  />
                </div>
              </div>
              <TextField label="Pool name:" value={poolCreation.name} isDisabled={true} />
              <TextField label="Pool symbol:" value={poolCreation.symbol} isDisabled={true} />
              {(() => {
                switch (poolCreation.step) {
                  case 1:
                    return (
                      <TransactionButton
                        title="Create Pool"
                        isPending={isCreatePending || isFetchPoolAddressPending}
                        isDisabled={isCreatePending || isFetchPoolAddressPending || isWrongNetwork}
                        onClick={() => {
                          createPool({ name: poolCreation.name, symbol: poolCreation.symbol });
                        }}
                      />
                    );
                  case 2:
                    return (
                      <TransactionButton
                        title={`Approve ${poolCreation.token1.symbol}`}
                        isPending={isApprove1Pending}
                        isDisabled={isApprove1Pending || isWrongNetwork}
                        onClick={() => {
                          approve1(
                            {
                              token: poolCreation.token1.address,
                              spender: poolData?.address,
                              rawAmount: token1RawAmount,
                            },
                            {
                              onSuccess: hash => {
                                refetchAllowance1();

                                if (allowance1 >= token1RawAmount)
                                  updatePoolCreation({ approveToken1TxHash: hash, step: 3 });
                              },
                            },
                          );
                        }}
                      />
                    );
                  case 3:
                    return (
                      <TransactionButton
                        title={`Approve ${poolCreation.token2.symbol}`}
                        isPending={isApprove2Pending}
                        isDisabled={isApprove2Pending || isWrongNetwork}
                        onClick={() => {
                          approve2(
                            {
                              token: poolCreation.token2.address,
                              spender: poolData?.address,
                              rawAmount: token2RawAmount,
                            },
                            {
                              onSuccess: hash => {
                                refetchAllowance2();
                                if (allowance2 >= token2RawAmount)
                                  updatePoolCreation({ approveToken2TxHash: hash, step: 4 });
                              },
                            },
                          );
                        }}
                      />
                    );

                  case 4:
                    return (
                      <TransactionButton
                        title={`Add ${poolCreation.token1.symbol}`}
                        isPending={isBind1Pending}
                        isDisabled={isBind1Pending || isWrongNetwork}
                        onClick={() => {
                          bind1(
                            {
                              pool: poolData?.address,
                              token: poolCreation.token1.address,
                              rawAmount: token1RawAmount,
                            },
                            {
                              onSuccess: hash => {
                                refetchPool();
                                updatePoolCreation({ bindToken1TxHash: hash, step: 5 });
                              },
                            },
                          );
                        }}
                      />
                    );
                  case 5:
                    return (
                      <TransactionButton
                        title={`Add ${poolCreation.token2.symbol}`}
                        isPending={isBind2Pending}
                        isDisabled={isBind2Pending || isWrongNetwork}
                        onClick={() => {
                          bind2(
                            {
                              pool: poolData?.address,
                              token: poolCreation.token2.address,
                              rawAmount: token2RawAmount,
                            },
                            {
                              onSuccess: hash => {
                                refetchPool();
                                updatePoolCreation({ bindToken2TxHash: hash, step: 6 });
                              },
                            },
                          );
                        }}
                      />
                    );
                  case 6:
                    return (
                      <>
                        <TransactionButton
                          title="Set Swap Fee"
                          isPending={isSetSwapFeePending}
                          isDisabled={isSetSwapFeePending || isWrongNetwork}
                          onClick={() => {
                            setSwapFee(
                              { pool: poolData?.address, rawAmount: poolData?.MAX_FEE },
                              {
                                onSuccess: hash => {
                                  refetchPool();
                                  updatePoolCreation({ setSwapFeeTxHash: hash, step: 7 });
                                },
                              },
                            );
                          }}
                        />
                      </>
                    );
                  case 7:
                    return (
                      <TransactionButton
                        title="Finalize"
                        isPending={isFinalizePending}
                        isDisabled={isFinalizePending || isWrongNetwork}
                        onClick={() => {
                          finalizePool(poolData?.address, {
                            onSuccess: hash => {
                              refetchPool();
                              updatePoolCreation({ finalizePoolTxHash: hash, step: 8 });
                            },
                          });
                        }}
                      />
                    );
                  case 8:
                    return <Alert type="success">Your CoW AMM poolCreation was successfully created!</Alert>;
                  default:
                    return null;
                }
              })()}
            </div>
          </div>

          {poolCreation.step === 6 && (
            <Alert type="info">CoW AMMs built on Balancer v1 set the swap fee to the maximum value</Alert>
          )}

          {txError && (
            <Alert type="error">
              <div className="flex items-center gap-2">
                {" "}
                Error: {(txError as { shortMessage?: string }).shortMessage || txError.message}
              </div>
            </Alert>
          )}

          {isWrongNetwork && (
            <Alert type="error">
              You&apos;re connected to the wrong network, switch to{" "}
              <span onClick={() => switchChain?.({ chainId: poolCreation.chainId })} className="link">
                {CHAIN_NAMES[poolCreation.chainId]}
              </span>{" "}
              to finish creating your poolCreation, or start over.
            </Alert>
          )}

          {poolCreation.step < 8 && (
            <div className="flex justify-center gap-2 items-center">
              <ContactSupportModal />
              <div className="text-xl">·</div>
              <PoolStateResetModal
                clearState={() => {
                  clearPoolCreation();
                }}
              />
            </div>
          )}

          {poolCreation.step === 8 && (
            <PoolCreated
              clearState={clearPoolCreation}
              etherscanURL={etherscanURL}
              poolAddress={poolData?.address}
              chainId={poolCreation.chainId}
            />
          )}
        </div>
        <div className="min-w-fit">
          <PoolStepsDisplay
            currentStepNumber={poolCreation.step}
            steps={[
              {
                label: "Create Pool",
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, createPoolTxHash),
              },
              {
                label: `Approve ${poolCreation.token1.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, approveToken1TxHash),
              },
              {
                label: `Approve ${poolCreation.token2.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, approveToken2TxHash),
              },
              {
                label: `Add ${poolCreation.token1.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, bindToken1TxHash),
              },
              {
                label: `Add ${poolCreation.token2.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, bindToken2TxHash),
              },
              {
                label: "Set Swap Fee",
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, setSwapFeeTxHash),
              },
              {
                label: "Finalize Pool",
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, finalizePoolTxHash),
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
