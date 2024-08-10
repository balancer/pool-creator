import { useEffect, useState } from "react";
import { PoolResetModal, StepsDisplay } from "./";
import { Address, parseUnits } from "viem";
import { Alert, ExternalLinkButton, TextField, TokenField, TransactionButton } from "~~/components/common/";
import {
  type PoolCreationState,
  getPoolUrl,
  useBindPool,
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

interface ManagePoolCreationProps {
  state: PoolCreationState;
  clearState: () => void;
}

export const PoolCreation = ({ state, clearState }: ManagePoolCreationProps) => {
  const token1RawAmount = parseUnits(state.token1Amount, state.token1.decimals);
  const token2RawAmount = parseUnits(state.token2Amount, state.token2.decimals);

  const [userPoolAddress, setUserPoolAddress] = useState<Address>();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useNewPoolEvents(setUserPoolAddress);
  const { targetNetwork } = useTargetNetwork();
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
  const refetchAllowances = () => {
    refetchAllowance1();
    refetchAllowance2();
  };

  const { mutate: createPool, isPending: isCreatePending, error: createPoolError } = useCreatePool();
  const { mutateAsync: approve, isPending: isApprovePending, error: approveError } = useApproveToken(refetchAllowances);
  const { mutateAsync: bind, isPending: isBindPending, error: bindError } = useBindPool(() => refetchPool());
  const { mutate: setSwapFee, isPending: isSetSwapFeePending, error: setSwapFeeError } = useSetSwapFee();
  const { mutate: finalizePool, isPending: isFinalizePending, error: finalizeError } = useFinalizePool();
  const txError = createPoolError || approveError || bindError || setSwapFeeError || finalizeError;

  const setPersistedState = usePoolCreationPersistedState(state => state.setPersistedState);

  const handleCreatePool = () => {
    createPool(
      { name: state.poolName, symbol: state.poolSymbol },
      {
        onSuccess: newPoolAddress => {
          setUserPoolAddress(newPoolAddress);
          setPersistedState({ ...state, step: 2 });
        },
      },
    );
  };

  const handleApproveTokens = async () => {
    const txs = [];
    if (token1RawAmount > allowance1) {
      txs.push(
        approve({
          token: state.token1.address,
          spender: pool?.address,
          rawAmount: token1RawAmount,
        }),
      );
    }
    if (token2RawAmount > allowance2)
      txs.push(
        approve({
          token: state.token2.address,
          spender: pool?.address,
          rawAmount: token2RawAmount,
        }),
      );
    const results = await Promise.all(txs);
    if (results.every(result => result === "success")) setPersistedState({ ...state, step: 3 });
  };

  const handleBindTokens = async () => {
    const txs = [];
    // If not already bound, bind the token
    const poolTokens = pool?.currentTokens.map(token => token.toLowerCase());
    if (!poolTokens?.includes(state.token1.address.toLowerCase())) {
      txs.push(
        bind({
          pool: pool?.address,
          token: state.token1.address,
          rawAmount: token1RawAmount,
        }),
      );
    }
    if (!poolTokens?.includes(state.token2.address.toLowerCase())) {
      txs.push(
        bind({
          pool: pool?.address,
          token: state.token2.address,
          rawAmount: token2RawAmount,
        }),
      );
    }
    const results = await Promise.all(txs);
    if (results.every(result => result === "success")) setPersistedState({ ...state, step: 4 });
  };

  const handleSetSwapFee = async () => {
    if (!pool) throw new Error("Pool is undefined in handleSetSwapFee");
    setSwapFee(
      { pool: pool.address, rawAmount: pool.MAX_FEE },
      { onSuccess: () => setPersistedState({ ...state, step: 5 }) },
    );
  };

  const handleFinalize = async () => {
    finalizePool(pool?.address, {
      onSuccess: () => setPersistedState({ ...state, step: 6 }),
    });
  };

  useEffect(() => {
    if (state.step === 1) return;
    if (pool && pool.numTokens < 2n) {
      if (allowance1 < token1RawAmount || allowance2 < token2RawAmount) {
        setPersistedState({ ...state, step: 2 });
      } else {
        setPersistedState({ ...state, step: 3 });
      }
    }
    if (pool && pool.numTokens === 2n && !pool.isFinalized) {
      if (pool.swapFee !== pool.MAX_FEE) {
        setPersistedState({ ...state, step: 4 });
      } else {
        setPersistedState({ ...state, step: 5 });
      }
    }
    if (pool && pool.isFinalized) setPersistedState({ ...state, step: 6 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, allowance1, allowance2, token1RawAmount, token2RawAmount]);

  const etherscanURL = pool && getBlockExplorerAddressLink(targetNetwork, pool.address);

  return (
    <>
      <div className="bg-base-200 p-7 rounded-xl w-full sm:w-[555px] flex flex-grow shadow-lg">
        <div className="flex flex-col items-center gap-3 w-full">
          <h5 className="text-xl md:text-2xl font-bold text-center">Preview your pool</h5>

          <div className="w-full">
            <div className="ml-1 mb-1">Selected pool tokens:</div>
            <div className="w-full flex flex-col gap-3">
              <TokenField value={state.token1Amount} selectedToken={state.token1} isDisabled={true} />
              <TokenField value={state.token2Amount} selectedToken={state.token2} isDisabled={true} />
            </div>
          </div>
          <TextField label="Pool name:" value={state.poolName} isDisabled={true} />
          <TextField label="Pool symbol:" value={state.poolSymbol} isDisabled={true} />
        </div>
      </div>
      {state.step < 6 && <StepsDisplay currentStep={state.step} />}

      {pool && state.step === 6 && (
        <>
          <Alert type="success">Your CoW AMM pool was successfully created!</Alert>

          <div className="bg-base-200 w-full p-5 rounded-xl flex flex-col gap-5">
            <div className="text-center">
              <div className=" sm:text-xl overflow-hidden ">{pool.address}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              <ExternalLinkButton href={getPoolUrl(state.chainId, pool.address)} text="View on Balancer" />
              {etherscanURL && <ExternalLinkButton href={etherscanURL} text="View on Etherscan" />}
            </div>
          </div>
          <Alert type="warning">It may take a few minutes to appear in the Balancer app</Alert>
        </>
      )}

      {isWrongNetwork && <Alert type="error">You&apos;re connected to the wrong network</Alert>}

      {txError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            {" "}
            Error: {(txError as { shortMessage?: string }).shortMessage || txError.message}
          </div>
        </Alert>
      )}

      {(() => {
        switch (state.step) {
          case 1:
            return (
              <>
                <TransactionButton
                  title="Create Pool"
                  isPending={isCreatePending}
                  isDisabled={isCreatePending || isWrongNetwork}
                  onClick={handleCreatePool}
                />
              </>
            );
          case 2:
            return (
              <TransactionButton
                title="Approve"
                isPending={isApprovePending}
                isDisabled={isApprovePending || isWrongNetwork}
                onClick={handleApproveTokens}
              />
            );
          case 3:
            return (
              <TransactionButton
                title="Add Liquidity"
                isPending={isBindPending}
                isDisabled={isBindPending || isWrongNetwork}
                onClick={handleBindTokens}
              />
            );
          case 4:
            return (
              <TransactionButton
                title="Set Swap Fee"
                onClick={handleSetSwapFee}
                isPending={isSetSwapFeePending}
                isDisabled={isSetSwapFeePending || isWrongNetwork}
              />
            );
          case 5:
            return (
              <TransactionButton
                title="Finalize"
                onClick={handleFinalize}
                isPending={isFinalizePending}
                isDisabled={isFinalizePending || isWrongNetwork}
              />
            );
          case 6:
            return (
              <TransactionButton
                title="Create Another Pool"
                onClick={clearState}
                isPending={false}
                isDisabled={false}
              />
            );
          default:
            return null;
        }
      })()}

      {state.step < 6 && (
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
