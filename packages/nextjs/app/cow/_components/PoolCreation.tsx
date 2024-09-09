import { useEffect, useState } from "react";
import { PoolCreated, PoolResetModal, StepsDisplay } from "./";
import { Address, parseUnits } from "viem";
import { useSwitchChain } from "wagmi";
import { Alert, TextField, TokenField, TransactionButton } from "~~/components/common/";
import { CHAIN_NAMES } from "~~/hooks/balancer/";
import {
  type PoolCreationState,
  useBindToken,
  useCreatePool,
  useFinalizePool,
  useNewPoolEvents,
  usePoolCreationPersistedState,
  useReadPool,
  useSetSwapFee,
} from "~~/hooks/cow/";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useApproveToken, useReadToken } from "~~/hooks/token";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth";
import { getPerTokenWeights } from "~~/utils/token-weights";

interface ManagePoolCreationProps {
  state: PoolCreationState;
  clearState: () => void;
}

export const PoolCreation = ({ state, clearState }: ManagePoolCreationProps) => {
  const token1RawAmount = parseUnits(state.token1Amount, state.token1.decimals);
  const token2RawAmount = parseUnits(state.token2Amount, state.token2.decimals);
  const { token1Weight, token2Weight } = getPerTokenWeights(state.tokenWeights);

  const [userPoolAddress, setUserPoolAddress] = useState<Address>();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useNewPoolEvents(setUserPoolAddress);
  const { targetNetwork } = useTargetNetwork();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = targetNetwork.id !== state.chainId;
  const { data: pool, refetch: refetchPool } = useReadPool(userPoolAddress);
  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(
    state.token1.address,
    pool?.address,
  );
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(
    state.token2.address,
    pool?.address,
  );
  const { mutate: createPool, isPending: isCreatePending, error: createPoolError } = useCreatePool();
  const { mutate: approve1, isPending: isApprove1Pending, error: approve1Error } = useApproveToken();
  const { mutate: approve2, isPending: isApprove2Pending, error: approve2Error } = useApproveToken();
  const { mutate: bind1, isPending: isBind1Pending, error: bind1Error } = useBindToken(state.tokenWeights, true);
  const { mutate: bind2, isPending: isBind2Pending, error: bind2Error } = useBindToken(state.tokenWeights, false);
  const { mutate: setSwapFee, isPending: isSetSwapFeePending, error: setSwapFeeError } = useSetSwapFee();
  const { mutate: finalizePool, isPending: isFinalizePending, error: finalizeError } = useFinalizePool();
  const txError =
    createPoolError || approve1Error || approve2Error || bind1Error || bind2Error || setSwapFeeError || finalizeError;

  const setPersistedState = usePoolCreationPersistedState(state => state.setPersistedState);

  useEffect(() => {
    if (state.step === 1) return;
    if (pool && pool.numTokens === 0n) {
      if (allowance1 < token1RawAmount) {
        setPersistedState({ ...state, step: 2 });
      } else if (allowance2 < token2RawAmount) {
        setPersistedState({ ...state, step: 3 });
      } else if (allowance1 >= token1RawAmount && allowance2 >= token2RawAmount) {
        setPersistedState({ ...state, step: 4 });
      }
    }
    if (pool && pool.numTokens === 1n) setPersistedState({ ...state, step: 5 });
    if (pool && pool.numTokens === 2n && !pool.isFinalized) {
      if (pool.swapFee !== pool.MAX_FEE) {
        setPersistedState({ ...state, step: 6 });
      } else {
        setPersistedState({ ...state, step: 7 });
      }
    }
    if (pool && pool.isFinalized) setPersistedState({ ...state, step: 8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allowance1, allowance2, token1RawAmount, token2RawAmount]);

  const etherscanURL = pool && getBlockExplorerAddressLink(targetNetwork, pool.address);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-5 lg:relative">
        <div className="bg-base-200 p-6 rounded-xl w-full flex flex-grow shadow-xl md:w-[555px]">
          <div className="flex flex-col items-center gap-5 w-full">
            <h5 className="text-xl md:text-2xl font-bold text-center">Preview your pool</h5>
            <div className="w-full">
              <div className="ml-1 mb-1">Selected pool tokens:</div>
              <div className="w-full flex flex-col gap-3">
                <TokenField
                  value={state.token1Amount}
                  selectedToken={state.token1}
                  isDisabled={true}
                  tokenWeight={token1Weight}
                />
                <TokenField
                  value={state.token2Amount}
                  selectedToken={state.token2}
                  isDisabled={true}
                  tokenWeight={token2Weight}
                />
              </div>
            </div>
            <TextField label="Pool name:" value={state.poolName} isDisabled={true} />
            <TextField label="Pool symbol:" value={state.poolSymbol} isDisabled={true} />
            {(() => {
              switch (state.step) {
                case 1:
                  return (
                    <TransactionButton
                      title="Create Pool"
                      isPending={isCreatePending}
                      isDisabled={isCreatePending || isWrongNetwork}
                      onClick={() => {
                        createPool(
                          { name: state.poolName, symbol: state.poolSymbol },
                          {
                            onSuccess: newPoolAddress => {
                              setUserPoolAddress(newPoolAddress);
                              setPersistedState({ ...state, step: 2 });
                            },
                          },
                        );
                      }}
                    />
                  );
                case 2:
                  return (
                    <TransactionButton
                      title={`Approve ${state.token1.symbol}`}
                      isPending={isApprove1Pending}
                      isDisabled={isApprove1Pending || isWrongNetwork}
                      onClick={() => {
                        approve1(
                          { token: state.token1.address, spender: pool?.address, rawAmount: token1RawAmount },
                          {
                            onSuccess: () => {
                              refetchAllowance1();
                              if (allowance1 >= token1RawAmount) setPersistedState({ ...state, step: 3 });
                            },
                          },
                        );
                      }}
                    />
                  );
                case 3:
                  return (
                    <TransactionButton
                      title={`Approve ${state.token2.symbol}`}
                      isPending={isApprove2Pending}
                      isDisabled={isApprove2Pending || isWrongNetwork}
                      onClick={() => {
                        approve2(
                          { token: state.token2.address, spender: pool?.address, rawAmount: token2RawAmount },
                          {
                            onSuccess: () => {
                              refetchAllowance2();
                              if (allowance2 >= token2RawAmount) setPersistedState({ ...state, step: 4 });
                            },
                          },
                        );
                      }}
                    />
                  );

                case 4:
                  return (
                    <TransactionButton
                      title={`Add ${state.token1.symbol}`}
                      isPending={isBind1Pending}
                      isDisabled={isBind1Pending || isWrongNetwork}
                      onClick={() => {
                        bind1(
                          {
                            pool: pool?.address,
                            token: state.token1.address,
                            rawAmount: token1RawAmount,
                          },
                          {
                            onSuccess: () => {
                              refetchPool();
                              setPersistedState({ ...state, step: 5 });
                            },
                          },
                        );
                      }}
                    />
                  );
                case 5:
                  return (
                    <TransactionButton
                      title={`Add ${state.token2.symbol}`}
                      isPending={isBind2Pending}
                      isDisabled={isBind2Pending || isWrongNetwork}
                      onClick={() => {
                        bind2(
                          {
                            pool: pool?.address,
                            token: state.token2.address,
                            rawAmount: token2RawAmount,
                          },
                          {
                            onSuccess: () => {
                              refetchPool();
                              setPersistedState({ ...state, step: 6 });
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
                            { pool: pool?.address, rawAmount: pool?.MAX_FEE },
                            {
                              onSuccess: () => {
                                refetchPool();
                                setPersistedState({ ...state, step: 7 });
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
                        finalizePool(pool?.address, {
                          onSuccess: () => {
                            refetchPool();
                            setPersistedState({ ...state, step: 8 });
                          },
                        });
                      }}
                    />
                  );
                case 8:
                  return <Alert type="success">Your CoW AMM pool was successfully created!</Alert>;
                default:
                  return null;
              }
            })()}
          </div>
        </div>
        <div className="flex lg:absolute lg:top-0 lg:-right-[225px]">
          <StepsDisplay state={state} />
        </div>
      </div>

      {state.step === 6 && <Alert type="info">All CoW AMMs must set the swap fee to the maximum of 99.99%</Alert>}
      {state.step === 8 && (
        <PoolCreated
          clearState={clearState}
          etherscanURL={etherscanURL}
          poolAddress={pool?.address}
          chainId={state.chainId}
        />
      )}

      {isWrongNetwork && (
        <Alert type="error">
          You&apos;re connected to the wrong network, switch to{" "}
          <span onClick={() => switchChain?.({ chainId: state.chainId })} className="link">
            {CHAIN_NAMES[state.chainId]}
          </span>{" "}
          to finish creating your pool, or start over.
        </Alert>
      )}

      {txError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            {" "}
            Error: {(txError as { shortMessage?: string }).shortMessage || txError.message}
          </div>
        </Alert>
      )}

      {state.step < 8 && (
        <div className=" link flex items-center gap-2" onClick={() => setIsResetModalOpen(true)}>
          Start Over
        </div>
      )}
      {isResetModalOpen && (
        <PoolResetModal
          setIsModalOpen={setIsResetModalOpen}
          etherscanURL={pool && !pool.isFinalized ? etherscanURL : undefined}
          clearState={() => clearState()}
        />
      )}
    </>
  );
};
