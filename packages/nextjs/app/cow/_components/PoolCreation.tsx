import { useState } from "react";
import { StepsDisplay } from "./StepsDisplay";
import { Address, parseUnits } from "viem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Alert, ExternalLinkButton, TextField, TokenField, TransactionButton } from "~~/components/common/";
import { useBindPool, useCreatePool, useFinalizePool, useReadPool, useSetSwapFee } from "~~/hooks/cow/";
import { getPoolUrl } from "~~/hooks/cow/getPoolUrl";
import { PoolCreationState } from "~~/hooks/cow/usePoolCreationState";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoolAddress, setUserPoolAddress] = useState<Address>();

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

  const handleCreatePool = () => {
    const payload = { name: state.poolName, symbol: state.poolSymbol };
    createPool(payload, {
      onSuccess: newPoolAddress => {
        setUserPoolAddress(newPoolAddress);
        setCurrentStep(2);
      },
    });
  };

  const handleApproveTokens = async () => {
    if (!pool) throw new Error("Pool address is required to approve tokens");
    const txs = [];
    if (token1RawAmount > allowance1) {
      txs.push(
        approve({
          token: state.token1.address,
          spender: pool.address,
          rawAmount: token1RawAmount,
        }),
      );
    }
    if (token2RawAmount > allowance2)
      txs.push(
        approve({
          token: state.token2.address,
          spender: pool.address,
          rawAmount: token2RawAmount,
        }),
      );
    const results = await Promise.all(txs);
    if (results.every(result => result === "success")) setCurrentStep(3);
  };

  const handleBindTokens = async () => {
    if (!pool) throw new Error("Required value is undefined in handleBindTokens");
    const poolTokens = pool.getCurrentTokens.map(token => token.toLowerCase());
    // If not already bound, bind the token
    const txs = [];
    if (!poolTokens.includes(state.token1.address.toLowerCase())) {
      txs.push(
        bind({
          pool: pool.address,
          token: state.token1.address,
          rawAmount: token1RawAmount,
        }),
      );
    }
    if (!poolTokens.includes(state.token2.address.toLowerCase())) {
      txs.push(
        bind({
          pool: pool.address,
          token: state.token2.address,
          rawAmount: token2RawAmount,
        }),
      );
    }
    const results = await Promise.all(txs);
    if (results.every(result => result === "success")) setCurrentStep(4);
  };

  const handleSetSwapFee = async () => {
    if (!pool) throw new Error("Pool is undefined in handleSetSwapFee");
    setSwapFee({ pool: pool.address, rawAmount: pool.MAX_FEE }, { onSuccess: () => setCurrentStep(5) });
  };

  const handleFinalize = async () => {
    if (!pool) throw new Error("Pool is undefined in handleFinalize");
    finalizePool(pool.address, {
      onSuccess: () => setCurrentStep(6),
    });
  };

  return (
    <>
      <div className="bg-base-200 p-7 rounded-xl w-full sm:w-[555px] flex flex-grow shadow-lg">
        <div className="flex flex-col items-center gap-4 w-full">
          <h5 className="text-xl md:text-2xl font-bold">Pool preview</h5>
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
      {currentStep < 6 && <StepsDisplay currentStep={currentStep} />}

      {pool && currentStep === 6 && (
        <>
          <div className="bg-base-200 w-full py-4 rounded-xl shadow-md text-center sm:text-lg overflow-hidden">
            {pool.address}
          </div>
          <Alert type="success">
            You CoW AMM pool was successfully created! Because of caching, it may take a few minutes for the pool to
            appear in the Balancer app
          </Alert>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <ExternalLinkButton href={getPoolUrl(state.chainId, pool.address)} text="View on Balancer" />
            <ExternalLinkButton
              href={getBlockExplorerAddressLink(targetNetwork, pool.address)}
              text="View on Etherscan"
            />
          </div>
        </>
      )}

      {isWrongNetwork && <Alert type="error">You&apos;re connected to the wrong network</Alert>}

      {(() => {
        switch (currentStep) {
          case 1:
            return (
              <TransactionButton
                title="Create Pool"
                isPending={isCreatePending}
                isDisabled={isCreatePending || isWrongNetwork}
                onClick={handleCreatePool}
              />
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

      {txError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" /> Error:{" "}
            {(txError as { shortMessage?: string }).shortMessage || txError.message}
          </div>
        </Alert>
      )}
    </>
  );
};
