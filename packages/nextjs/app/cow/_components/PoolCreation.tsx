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
import {
  type PoolCreationState,
  useApproveTokenTxHash,
  useBindToken,
  useBindTokenTxHash,
  useCreatePool,
  useCreatePoolTxHash,
  useFinalizePool,
  useFinalizePoolTxHash,
  useSetSwapFee,
  useSetSwapFeeTxHash,
} from "~~/hooks/cow/";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useApproveToken } from "~~/hooks/token";
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
    tokenWeights,
    createPoolTx,
    approveToken1Tx,
    approveToken2Tx,
    bindToken1Tx,
    bindToken2Tx,
    setSwapFeeTx,
    finalizePoolTx,
  } = poolCreation;

  const token1RawAmount = parseUnits(poolCreation.token1Amount, poolCreation.token1.decimals);
  const token2RawAmount = parseUnits(poolCreation.token2Amount, poolCreation.token2.decimals);
  const { token1Weight, token2Weight } = getPerTokenWeights(poolCreation.tokenWeights);

  const { targetNetwork } = useTargetNetwork();
  const { switchChain } = useSwitchChain();
  const isWrongNetwork = targetNetwork.id !== poolCreation.chainId;

  const { mutate: createPool, isPending: isCreatePending, error: createPoolError } = useCreatePool();
  const { isFetching: isCreatePoolTxPending, error: createPoolTxError } = useCreatePoolTxHash();

  const {
    mutate: approve1,
    isPending: isApprove1Pending,
    error: approve1Error,
  } = useApproveToken({
    onSafeTxHash: safeHash =>
      updatePoolCreation({ approveToken1Tx: { safeHash, wagmiHash: undefined, isSuccess: false } }),
    onWagmiTxHash: wagmiHash =>
      updatePoolCreation({ approveToken1Tx: { wagmiHash, safeHash: undefined, isSuccess: false } }),
  });
  const { isFetching: isApproveToken1TxHashFetching, error: approveToken1TxHashError } = useApproveTokenTxHash({
    tokenNumber: 1,
  });

  const {
    mutate: approve2,
    isPending: isApprove2Pending,
    error: approve2Error,
  } = useApproveToken({
    onSafeTxHash: safeHash =>
      updatePoolCreation({ approveToken2Tx: { safeHash, wagmiHash: undefined, isSuccess: false } }),
    onWagmiTxHash: wagmiHash =>
      updatePoolCreation({ approveToken2Tx: { wagmiHash, safeHash: undefined, isSuccess: false } }),
  });
  const { isFetching: isApproveToken2TxHashFetching, error: approveToken2TxHashError } = useApproveTokenTxHash({
    tokenNumber: 2,
  });

  const { mutate: bind1, isPending: isBind1Pending, error: bind1Error } = useBindToken(tokenWeights, true);
  const { isFetching: isBindToken1TxHashFetching, error: bindToken1TxHashError } = useBindTokenTxHash({
    tokenNumber: 1,
  });

  const { mutate: bind2, isPending: isBind2Pending, error: bind2Error } = useBindToken(tokenWeights, false);
  const { isFetching: isBindToken2TxHashFetching, error: bindToken2TxHashError } = useBindTokenTxHash({
    tokenNumber: 2,
  });
  const { mutate: setSwapFee, isPending: isSetSwapFeePending, error: setSwapFeeError } = useSetSwapFee();
  const { isFetching: isSetSwapFeeTxHashFetching, error: setSwapFeeTxHashError } = useSetSwapFeeTxHash();

  const { mutate: finalizePool, isPending: isFinalizePending, error: finalizeError } = useFinalizePool();
  const { isFetching: isFinalizePoolTxHashFetching, error: finalizePoolTxHashError } = useFinalizePoolTxHash();

  const txError =
    createPoolError ||
    createPoolTxError ||
    approve1Error ||
    approveToken1TxHashError ||
    approve2Error ||
    approveToken2TxHashError ||
    bind1Error ||
    bindToken1TxHashError ||
    bind2Error ||
    bindToken2TxHashError ||
    setSwapFeeError ||
    finalizeError ||
    setSwapFeeTxHashError ||
    finalizePoolTxHashError;

  const etherscanURL = poolAddress && getBlockExplorerAddressLink(targetNetwork, poolAddress);

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
                        isPending={isCreatePending || isCreatePoolTxPending}
                        isDisabled={isCreatePending || isCreatePoolTxPending || isWrongNetwork}
                        onClick={() => {
                          createPool({ name: poolCreation.name, symbol: poolCreation.symbol });
                        }}
                      />
                    );
                  case 2:
                    return (
                      <TransactionButton
                        title={`Approve ${poolCreation.token1.symbol}`}
                        isPending={isApprove1Pending || isApproveToken1TxHashFetching}
                        isDisabled={isApprove1Pending || isApproveToken1TxHashFetching || isWrongNetwork}
                        onClick={() => {
                          approve1({
                            token: poolCreation.token1.address,
                            spender: poolAddress,
                            rawAmount: token1RawAmount,
                          });
                        }}
                      />
                    );
                  case 3:
                    return (
                      <TransactionButton
                        title={`Approve ${poolCreation.token2.symbol}`}
                        isPending={isApprove2Pending || isApproveToken2TxHashFetching}
                        isDisabled={isApprove2Pending || isApproveToken2TxHashFetching || isWrongNetwork}
                        onClick={() => {
                          approve2({
                            token: poolCreation.token2.address,
                            spender: poolAddress,
                            rawAmount: token2RawAmount,
                          });
                        }}
                      />
                    );

                  case 4:
                    return (
                      <TransactionButton
                        title={`Add ${poolCreation.token1.symbol}`}
                        isPending={isBind1Pending || isBindToken1TxHashFetching}
                        isDisabled={isBind1Pending || isBindToken1TxHashFetching || isWrongNetwork}
                        onClick={() => {
                          bind1({
                            pool: poolAddress,
                            token: poolCreation.token1.address,
                            rawAmount: token1RawAmount,
                          });
                        }}
                      />
                    );
                  case 5:
                    return (
                      <TransactionButton
                        title={`Add ${poolCreation.token2.symbol}`}
                        isPending={isBind2Pending || isBindToken2TxHashFetching}
                        isDisabled={isBind2Pending || isBindToken2TxHashFetching || isWrongNetwork}
                        onClick={() => {
                          bind2({
                            pool: poolAddress,
                            token: poolCreation.token2.address,
                            rawAmount: token2RawAmount,
                          });
                        }}
                      />
                    );
                  case 6:
                    return (
                      <>
                        <TransactionButton
                          title="Set Swap Fee"
                          isPending={isSetSwapFeePending || isSetSwapFeeTxHashFetching}
                          isDisabled={isSetSwapFeePending || isSetSwapFeeTxHashFetching || isWrongNetwork}
                          onClick={() => {
                            setSwapFee({ pool: poolAddress });
                          }}
                        />
                      </>
                    );
                  case 7:
                    return (
                      <TransactionButton
                        title="Finalize"
                        isPending={isFinalizePending || isFinalizePoolTxHashFetching}
                        isDisabled={isFinalizePending || isFinalizePoolTxHashFetching || isWrongNetwork}
                        onClick={() => {
                          finalizePool(poolAddress);
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
                Error: {(txError as { shortMessage?: string }).shortMessage || txError.message}
              </div>
            </Alert>
          )}

          {isWrongNetwork && (
            <Alert type="error">
              You&apos;re connected to the wrong network, switch back to{" "}
              <span onClick={() => switchChain?.({ chainId: poolCreation.chainId })} className="link">
                {poolCreation.chainName}
              </span>{" "}
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
                trigger={<span className="hover:underline">Reset Progress</span>}
              />
            </div>
          )}

          {poolCreation.step === 8 && (
            <PoolCreated
              clearState={clearPoolCreation}
              etherscanURL={etherscanURL}
              poolAddress={poolAddress}
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
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, createPoolTx?.wagmiHash),
              },
              {
                label: `Approve ${poolCreation.token1.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, approveToken1Tx?.wagmiHash),
              },
              {
                label: `Approve ${poolCreation.token2.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, approveToken2Tx?.wagmiHash),
              },
              {
                label: `Add ${poolCreation.token1.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, bindToken1Tx?.wagmiHash),
              },
              {
                label: `Add ${poolCreation.token2.symbol}`,
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, bindToken2Tx?.wagmiHash),
              },
              {
                label: "Set Swap Fee",
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, setSwapFeeTx?.wagmiHash),
              },
              {
                label: "Finalize Pool",
                blockExplorerUrl: getBlockExplorerTxLink(poolCreation.chainId, finalizePoolTx?.wagmiHash),
              },
            ]}
          />
        </div>
      </div>
    </>
  );
};
