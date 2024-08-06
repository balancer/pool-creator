import { useEffect, useState } from "react";
import Link from "next/link";
import { StepsDisplay } from "./StepsDisplay";
import { Address, parseUnits } from "viem";
import { Alert, TextField, TokenField, TransactionButton } from "~~/components/common/";
import { useBindPool, useCreatePool, useFinalizePool, useReadPool, useSetSwapFee } from "~~/hooks/cow/";
import { getPoolUrl } from "~~/hooks/cow/getPoolUrl";
import { PoolCreationState } from "~~/hooks/cow/usePoolCreationState";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { useApproveToken, useReadToken } from "~~/hooks/token";

interface ManagePoolCreationProps {
  state: PoolCreationState;
  clearState: () => void;
}

export const PoolCreation = ({ state, clearState }: ManagePoolCreationProps) => {
  const token1RawAmount = parseUnits(state.token1Amount, state.token1.decimals);
  const token2RawAmount = parseUnits(state.token2Amount, state.token2.decimals);
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoolAddress, setUserPoolAddress] = useState<Address>();
  const [poolFinalized, setPoolFinalized] = useState<boolean>(false);

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

  const {
    mutate: createPool,
    isPending: isCreatePending,
    // error: createPoolError,
  } = useCreatePool();
  const {
    mutate: approve,
    isPending: isApprovePending,
    // error: approveError,
  } = useApproveToken(refetchAllowances);
  const {
    mutate: bind,
    isPending: isBindPending,
    // error: bindError,
  } = useBindPool();
  const {
    mutate: setSwapFee,
    isPending: isSetSwapFeePending,
    // error: setSwapFeeError,
  } = useSetSwapFee();
  const {
    mutate: finalizePool,
    isPending: isFinalizePending,
    // error: finalizeError,
  } = useFinalizePool();

  const handleCreatePool = () =>
    createPool(
      { name: state.poolName, symbol: state.poolSymbol },
      { onSuccess: newPoolAddress => setUserPoolAddress(newPoolAddress) },
    );

  const handleApproveTokens = async () => {
    const approve1Payload = {
      token: state.token1.address,
      spender: pool?.address,
      rawAmount: token1RawAmount,
    };
    const approve2Payload = {
      token: state.token2.address,
      spender: pool?.address,
      rawAmount: token2RawAmount,
    };

    if (token1RawAmount > allowance1) approve(approve1Payload);
    if (token2RawAmount > allowance2) approve(approve2Payload);
  };

  const handleBindTokens = async () => {
    if (!pool) throw new Error("Required value is undefined in handleBindTokens");
    const poolTokens = pool.getCurrentTokens.map(token => token.toLowerCase());
    // If not already bound, bind the token1
    if (!poolTokens.includes(state.token1.address.toLowerCase())) {
      bind(
        {
          pool: pool.address,
          token: state.token1.address,
          rawAmount: token1RawAmount,
        },
        { onSuccess: () => refetchPool() },
      );
    }
    // If not already bound, bind token2
    if (!poolTokens.includes(state.token2.address.toLowerCase())) {
      bind(
        {
          pool: pool.address,
          token: state.token2.address,
          rawAmount: token2RawAmount,
        },
        { onSuccess: () => refetchPool() },
      );
    }
  };

  const handleSetSwapFee = async () => {
    if (!pool) throw new Error("Pool is undefined in handleSetSwapFee");
    setSwapFee({ pool: pool.address, rawAmount: pool.MAX_FEE }, { onSuccess: () => refetchPool() });
  };

  const handleFinalize = async () => {
    if (!pool) throw new Error("Pool is undefined in handleFinalize");
    finalizePool(pool.address, {
      onSuccess: () => {
        refetchPool();
        setPoolFinalized(true);
        setCurrentStep(6);
      },
    });
  };

  const validTokenAmounts = token1RawAmount > 0n && token2RawAmount > 0n;

  useEffect(() => {
    // If user has no pools or their most recent pool is already finalized
    // if (!userPoolAddress || pool?.isFinalized) {
    //   setCurrentStep(1);
    // }
    // If user has created a pool, but not finalized and tokens not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      // If user has not approved tokens
      if (token1RawAmount > allowance1 || token2RawAmount > allowance2 || !validTokenAmounts) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
    // If user has pool with 2 tokens binded, but it has not been finalized
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens === 2n) {
      if (pool.getSwapFee !== pool.MAX_FEE) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    }
  }, [
    pool,
    userPoolAddress,
    pool?.isFinalized,
    pool?.getNumTokens,
    allowance1,
    allowance2,
    token1RawAmount,
    token2RawAmount,
    validTokenAmounts,
    currentStep,
    targetNetwork,
  ]);

  // const txError = createPoolError || approveError || bindError || setSwapFeeError || finalizeError;

  return (
    <>
      <div className="bg-base-200 p-7 rounded-xl w-full sm:w-[555px] flex flex-grow">
        <div className="flex flex-col items-center gap-4 w-full">
          <h5 className="text-xl md:text-2xl font-bold">Pool preview</h5>
          <div className="w-full">
            <div className="ml-1 mb-1">Selected pool tokens:</div>
            <div className="w-full flex flex-col gap-3">
              <TokenField
                value={state.token1Amount}
                selectedToken={state.token1}
                setToken={() => {
                  //
                }}
                tokenOptions={[]}
                handleAmountChange={() => {
                  //
                }}
                isDisabled={true}
              />
              <TokenField
                value={state.token2Amount}
                selectedToken={state.token2}
                setToken={() => {
                  //
                }}
                tokenOptions={[]}
                handleAmountChange={() => {
                  //
                }}
                isDisabled={true}
              />
            </div>
          </div>
          <TextField
            label="Pool name:"
            placeholder=""
            value={state.poolName}
            onChange={() => {
              //
            }}
            isDisabled={true}
          />
          <TextField
            label="Pool symbol:"
            placeholder=""
            value={state.poolSymbol}
            onChange={() => {
              //
            }}
            isDisabled={true}
          />
        </div>
      </div>
      <StepsDisplay currentStep={currentStep} />

      {poolFinalized && (
        <>
          <Alert type="success">
            You CoW AMM pool was successfully created! To view your pool, go to the{" "}
            <Link
              className="link"
              rel="noopener noreferrer"
              target="_blank"
              href={getPoolUrl(state.chainId, pool?.address || "")}
            >
              Balancer app
            </Link>
            . Because of caching, it may take a few minutes for the pool to appear in the UI.
          </Alert>

          <div className="min-w-96 px-5">
            <Link
              className={`flex flex-col items-center justify-center text-lg w-full rounded-xl h-[50px] font-bold text-neutral-700 bg-gradient-to-r from-violet-400 via-orange-100 to-orange-300 hover:from-violet-300 hover:via-orange-100 hover:to-orange-400`}
              rel="noopener noreferrer"
              target="_blank"
              href={getPoolUrl(state.chainId, pool?.address || "")}
            >
              View My Pool
            </Link>
          </div>
        </>
      )}

      {isWrongNetwork && <Alert type="error">You&apos;re connected to the wrong network</Alert>}

      <div className="min-w-96 px-5">
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
                  title="Create another pool"
                  onClick={clearState}
                  isPending={false}
                  isDisabled={false}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
      {/* {txError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" /> Error:{" "}
            {(txError as { shortMessage?: string }).shortMessage || "An unknown error occurred"}
          </div>
        </Alert>
      )} */}
    </>
  );
};
