import { useEffect, useState } from "react";
import { StepsDisplay } from "./StepsDisplay";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { TransactionButton } from "~~/components/common/";
import { type ExistingPool, useNewPoolEvents, useReadPool, useWritePool } from "~~/hooks/cow/";
import { useReadToken, useWriteToken } from "~~/hooks/token";

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
  setIsFormDisabled: (isDisabled: boolean) => void;
  resetForm: () => void;
}

export const ManagePoolCreation = ({
  name,
  symbol,
  token1,
  token2,
  hasAgreedToWarning,
  existingPool,
  setIsFormDisabled,
  resetForm,
}: ManagePoolCreationProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoolAddress, setUserPoolAddress] = useState<Address>();
  // TODO: refactor to using tanstack query
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const [isSettingFee, setIsSettingSwapFee] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { address: connectedAddress } = useAccount();
  const { data: pool, refetch: refetchPool } = useReadPool(userPoolAddress);
  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(token1?.address, pool?.address);
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(token2?.address, pool?.address);
  const { approve: approve1 } = useWriteToken(token1?.address, pool?.address);
  const { approve: approve2 } = useWriteToken(token2?.address, pool?.address);
  const { createPool, bind, setSwapFee, finalize } = useWritePool(pool?.address);
  useNewPoolEvents(connectedAddress, setUserPoolAddress); // listen for user's pool creation events

  const validTokenAmounts = token1.rawAmount > 0n && token2.rawAmount > 0n;

  const handleCreatePool = async () => {
    try {
      setIsCreatingPool(true);
      const newPool = await createPool(name, symbol);
      setUserPoolAddress(newPool);
      setCurrentStep(2);
    } catch (e) {
      console.error("Error creating pool", e);
    } finally {
      setIsCreatingPool(false);
    }
  };

  const handleApproveTokens = async () => {
    try {
      setIsApproving(true);
      const txs = [];
      if (token1.rawAmount > allowance1) txs.push(approve1(token1.rawAmount));
      if (token2.rawAmount > allowance2) txs.push(approve2(token2.rawAmount));
      await Promise.all(txs);
      refetchAllowance1();
      refetchAllowance2();
    } catch (e) {
      console.error("Error approving tokens", e);
    } finally {
      setIsApproving(false);
    }
  };

  const handleBindTokens = async () => {
    if (!token1.address || !token2.address) throw new Error("Must select tokens before binding");
    try {
      setIsBinding(true);
      await Promise.all([bind(token1.address, token1.rawAmount), bind(token2.address, token2.rawAmount)]);
      refetchPool();
    } catch (e) {
      console.error("Error approving tokens", e);
    } finally {
      setIsBinding(false);
    }
  };

  const handleSetSwapFee = async () => {
    if (!pool) throw new Error("Cannot set swap fee without a pool");
    try {
      setIsSettingSwapFee(true);
      await setSwapFee(pool.MAX_FEE);
      refetchPool();
    } catch (e) {
      console.error("Error setting swap fee", e);
    } finally {
      setIsSettingSwapFee(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      await finalize();
      refetchPool();
      resetForm();
    } catch (e) {
      console.error("Error finalizing pool", e);
    } finally {
      setIsFinalizing(false);
    }
  };

  useEffect(() => {
    // Creating the pool sets the name and symbol permanently
    if (currentStep > 1) {
      setIsFormDisabled(true);
    } else {
      setIsFormDisabled(false);
    }
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
    connectedAddress,
    pool?.isFinalized,
    pool?.getNumTokens,
    allowance1,
    allowance2,
    token1.rawAmount,
    token2.rawAmount,
    validTokenAmounts,
    currentStep,
    setIsFormDisabled,
  ]);

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
                  isPending={isCreatingPool}
                  isDisabled={
                    isCreatingPool ||
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
                  isPending={isApproving}
                  isDisabled={
                    isApproving ||
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
                  isPending={isBinding}
                  isDisabled={isBinding || !hasAgreedToWarning}
                  onClick={handleBindTokens}
                />
              );
            case 4:
              return (
                <TransactionButton
                  title="Set Swap Fee"
                  onClick={handleSetSwapFee}
                  isPending={isSettingFee}
                  isDisabled={isSettingFee || !hasAgreedToWarning}
                />
              );
            case 5:
              return (
                <TransactionButton
                  title="Finalize"
                  onClick={handleFinalize}
                  isPending={isFinalizing}
                  isDisabled={isFinalizing || !hasAgreedToWarning}
                />
              );
            default:
              return null;
          }
        })()}
      </div>
    </>
  );
};
