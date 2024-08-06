import { useEffect, useState } from "react";
import { StepsDisplay } from "./StepsDisplay";
import { Address } from "viem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Alert, TransactionButton } from "~~/components/common/";
import {
  type ExistingPool,
  useBindPool,
  useCreatePool,
  useFinalizePool,
  useNewPoolEvents,
  useReadPool,
  useSetSwapFee,
} from "~~/hooks/cow/";
import { useApproveToken, useReadToken } from "~~/hooks/token";

type TokenInput = {
  rawAmount: bigint;
  address: Address | undefined;
};

interface ManagePoolCreationProps {
  name: string;
  symbol: string;
  token1: TokenInput;
  token2: TokenInput;
  hasAgreedToWarning: boolean;
  existingPool: ExistingPool | undefined;
  setIsChangeNameDisabled: (isDisabled: boolean) => void;
  setIsChangeTokensDisabled: (isDisabled: boolean) => void;
  resetForm: () => void;
}

export const ManagePoolCreation = ({
  name,
  symbol,
  token1,
  token2,
  hasAgreedToWarning,
  existingPool,
  setIsChangeNameDisabled,
  setIsChangeTokensDisabled,
  resetForm,
}: ManagePoolCreationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoolAddress, setUserPoolAddress] = useState<Address>();
  console.log("render");
  const { data: pool, refetch: refetchPool } = useReadPool(userPoolAddress);
  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(token1?.address, pool?.address);
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(token2?.address, pool?.address);
  useNewPoolEvents(setUserPoolAddress); // grab / listen for user's pool creation events to set the target pool address

  const { mutate: createPool, isPending: isCreatePending, error: createPoolError } = useCreatePool();
  const {
    mutate: approve,
    isPending: isApprovePending,
    error: approveError,
  } = useApproveToken(() => {
    refetchAllowance1();
    refetchAllowance2();
  });
  const { mutate: bind, isPending: isBindPending, error: bindError } = useBindPool();
  const { mutate: setSwapFee, isPending: isSetSwapFeePending, error: setSwapFeeError } = useSetSwapFee();
  const { mutate: finalizePool, isPending: isFinalizePending, error: finalizeError } = useFinalizePool();

  const handleCreatePool = () =>
    createPool({ name, symbol }, { onSuccess: newPoolAddress => setUserPoolAddress(newPoolAddress) });

  const handleApproveTokens = async () => {
    const approve1Payload = { token: token1?.address, spender: pool?.address, rawAmount: token1.rawAmount };
    const approve2Payload = { token: token2?.address, spender: pool?.address, rawAmount: token2.rawAmount };
    if (token1.rawAmount > allowance1) approve(approve1Payload);
    if (token2.rawAmount > allowance2) approve(approve2Payload);
  };

  const handleBindTokens = async () => {
    if (!token1.address || !token2.address || !pool) throw new Error("Required value is undefined in handleBindTokens");
    const poolTokens = pool.getCurrentTokens.map(token => token.toLowerCase());
    // If not already bound, bind the token1
    if (!poolTokens.includes(token1.address.toLowerCase())) {
      bind(
        { pool: pool.address, token: token1.address, rawAmount: token1.rawAmount },
        { onSuccess: () => refetchPool() },
      );
    }
    // If not already bound, bind token2
    if (!poolTokens.includes(token2.address.toLowerCase())) {
      bind(
        { pool: pool.address, token: token2.address, rawAmount: token2.rawAmount },
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
        resetForm();
      },
    });
  };

  const validTokenAmounts = token1.rawAmount > 0n && token2.rawAmount > 0n;

  useEffect(() => {
    // Creating the pool sets the name and symbol permanently
    currentStep > 1 ? setIsChangeNameDisabled(true) : setIsChangeNameDisabled(false);
    // Binding the tokens sets the tokens permanently
    currentStep > 3 ? setIsChangeTokensDisabled(true) : setIsChangeTokensDisabled(false);
    // If user has no pools or their most recent pool is already finalized
    if (userPoolAddress || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If user has created a pool, but not finalized and tokens not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      // If user has not approved tokens
      if (token1.rawAmount > allowance1 || token2.rawAmount > allowance2 || !validTokenAmounts) {
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
    token1.rawAmount,
    token2.rawAmount,
    validTokenAmounts,
    currentStep,
    setIsChangeNameDisabled,
    setIsChangeTokensDisabled,
  ]);

  const txError = createPoolError || approveError || bindError || setSwapFeeError || finalizeError;

  return (
    <>
      <StepsDisplay currentStep={currentStep} />

      <div className="min-w-96 px-5">
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <TransactionButton
                  title="Create Pool"
                  isPending={isCreatePending}
                  isDisabled={
                    isCreatePending ||
                    // If user has not selected tokens or entered amounts
                    !token1.address ||
                    !token2.address ||
                    !validTokenAmounts ||
                    !hasAgreedToWarning ||
                    existingPool !== undefined ||
                    name === "" ||
                    symbol === ""
                  }
                  onClick={handleCreatePool}
                />
              );
            case 2:
              return (
                <TransactionButton
                  title="Approve"
                  isPending={isApprovePending}
                  isDisabled={
                    isApprovePending ||
                    // If user has not selected tokens or entered amounts
                    token1.address === undefined ||
                    token2.address === undefined ||
                    token1.rawAmount === 0n ||
                    token2.rawAmount === 0n ||
                    !hasAgreedToWarning
                  }
                  onClick={handleApproveTokens}
                />
              );
            case 3:
              return (
                <TransactionButton
                  title="Add Liquidity"
                  isPending={isBindPending}
                  isDisabled={isBindPending || !hasAgreedToWarning}
                  onClick={handleBindTokens}
                />
              );
            case 4:
              return (
                <TransactionButton
                  title="Set Swap Fee"
                  onClick={handleSetSwapFee}
                  isPending={isSetSwapFeePending}
                  isDisabled={isSetSwapFeePending || !hasAgreedToWarning}
                />
              );
            case 5:
              return (
                <TransactionButton
                  title="Finalize"
                  onClick={handleFinalize}
                  isPending={isFinalizePending}
                  isDisabled={isFinalizePending || !hasAgreedToWarning}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
      {txError && (
        <Alert type="error">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" /> Error:{" "}
            {(txError as { shortMessage?: string }).shortMessage || "An unknown error occurred"}
          </div>
        </Alert>
      )}
    </>
  );
};
