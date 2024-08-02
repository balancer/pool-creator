import { useEffect, useState } from "react";
import Link from "next/link";
import { Alert } from "./Alert";
import { StepsDisplay } from "./StepsDisplay";
import { Address } from "viem";
import { useAccount } from "wagmi";
import { TransactionButton } from "~~/components/common/";
import { useFetchExistingPools, useReadPool, useWritePool } from "~~/hooks/cow/";
import { useScaffoldEventHistory, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";
import { useReadToken, useWriteToken } from "~~/hooks/token";

type TokenInput = {
  rawAmount: bigint;
  address: Address | undefined;
};

interface CreatePoolProps {
  name: string;
  symbol: string;
  token1: TokenInput;
  token2: TokenInput;
}

export const CreatePool = ({ name, symbol, token1, token2 }: CreatePoolProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [hasAgreedToWarning, setHasAgreedToWarning] = useState(false);
  const [userPoolAddress, setUserPoolAddress] = useState<string>();

  // TODO: refactor to using tanstack query
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const [isSettingFee, setIsSettingSwapFee] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { address } = useAccount();

  const { data: pool, refetch: refetchPool } = useReadPool(userPoolAddress);
  const { data: existingPools } = useFetchExistingPools();

  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(token1?.address, pool?.address);
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(token2?.address, pool?.address);
  const { approve: approve1 } = useWriteToken(token1?.address, pool?.address);
  const { approve: approve2 } = useWriteToken(token2?.address, pool?.address);
  const { createPool, bind, setSwapFee, finalize } = useWritePool(pool?.address);

  const handleCreatePool = async () => {
    console.log("name", name);
    console.log("symbol", symbol);
    try {
      setIsCreatingPool(true);
      const newPool = await createPool();
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
    } catch (e) {
      console.error("Error finalizing pool", e);
    } finally {
      setIsFinalizing(false);
    }
  };

  const { data: events, isLoading: isLoadingEvents } = useScaffoldEventHistory({
    contractName: "BCoWFactory",
    eventName: "LOG_NEW_POOL",
    fromBlock: 6381641n,
    watch: true,
    filters: { caller: address },
  });

  useScaffoldWatchContractEvent({
    contractName: "BCoWFactory",
    eventName: "LOG_NEW_POOL",
    onLogs: logs => {
      logs.forEach(log => {
        const { bPool, caller } = log.args;
        if (bPool && caller == address) {
          console.log("useScaffoldWatchContractEvent: LOG_NEW_POOL", { bPool, caller });
          setUserPoolAddress(bPool);
        }
      });
    },
  });

  useEffect(() => {
    if (!isLoadingEvents && events) {
      const pools = events.map(e => e.args.bPool).filter((pool): pool is string => pool !== undefined);
      const mostRecentlyCreated = pools[0];
      setUserPoolAddress(mostRecentlyCreated);
    }
  }, [isLoadingEvents, events]);

  const validTokenAmounts = token1.rawAmount > 0n && token2.rawAmount > 0n;
  useEffect(() => {
    // If the user has no pools or their most recent pool is finalized
    if (userPoolAddress || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If the user has created a pool, but not finalized and tokens not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      // If user has not approved tokens
      if (allowance1 >= token1.rawAmount && allowance2 >= token2.rawAmount && validTokenAmounts) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
    // If the user has a pool with 2 tokens binded, but it has not been finalized
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens === 2n) {
      // If the pool swap fee has not been set to the maximum
      if (pool.getSwapFee !== pool.MAX_FEE) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    }
  }, [
    pool,
    userPoolAddress,
    address,
    events,
    isLoadingEvents,
    pool?.isFinalized,
    pool?.getNumTokens,
    allowance1,
    allowance2,
    token1.rawAmount,
    token2.rawAmount,
    validTokenAmounts,
  ]);

  const isApproveDisabled = // If user has not selected tokens or entered amounts
    token1.rawAmount === 0n || token2.rawAmount === 0n || token1.address === undefined || token2.address === undefined;

  const existingPool = existingPools?.find(pool => {
    if (!token1.address || !token2.address) return false;
    const poolTokenAddresses = pool.allTokens.map(token => token.address);
    const hasOnlyTwoTokens = poolTokenAddresses.length === 2;
    const selectedToken1 = token1.address.toLowerCase() ?? "";
    const selectedToken2 = token2.address.toLowerCase() ?? "";
    const includesToken1 = poolTokenAddresses.includes(selectedToken1);
    const includesToken2 = poolTokenAddresses.includes(selectedToken2);
    const has5050Weight = pool.allTokens.every(token => token.weight === "0.5");
    const hasMaxSwapFee = pool.dynamicData.swapFee === "0.999999";
    return hasOnlyTwoTokens && has5050Weight && hasMaxSwapFee && includesToken1 && includesToken2;
  });

  return (
    <>
      {existingPool ? (
        <Alert bgColor="bg-[#d64e4e2b]" borderColor="border-red-500">
          A CoW AMM pool with selected tokens already exists. To add liquidity, go to the{" "}
          <Link
            className="link"
            rel="noopener noreferrer"
            target="_blank"
            href={`https://balancer.fi/pools/${existingPool.chain.toLowerCase()}/cow/${existingPool.address}`}
          >
            Balancer v3 frontend.
          </Link>
        </Alert>
      ) : (
        <Alert bgColor="bg-[#fb923c40]" borderColor="border-orange-400">
          <div className="flex gap-2">
            <div>
              <div className="form-control">
                <label className="label cursor-pointer flex gap-4 m-0 p-0">
                  <input
                    type="checkbox"
                    className="checkbox rounded-lg"
                    onChange={() => setHasAgreedToWarning(!hasAgreedToWarning)}
                    checked={hasAgreedToWarning}
                  />
                  <span className="">
                    I understand that assets must be added proportionally, or I risk loss of funds via arbitrage.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </Alert>
      )}

      <StepsDisplay currentStep={currentStep} />

      <div className="min-w-96">
        {(() => {
          switch (currentStep) {
            case 1:
              return (
                <TransactionButton
                  title="Create Pool"
                  isPending={isCreatingPool}
                  isDisabled={
                    isCreatingPool ||
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
                  isDisabled={isApproveDisabled || isApproving}
                  onClick={handleApproveTokens}
                />
              );
            case 3:
              return (
                <TransactionButton
                  title="Add Liquidity"
                  isPending={isBinding}
                  isDisabled={isBinding}
                  onClick={handleBindTokens}
                />
              );
            case 4:
              return (
                <TransactionButton
                  title="Set Swap Fee"
                  onClick={handleSetSwapFee}
                  isPending={isSettingFee}
                  isDisabled={isSettingFee}
                />
              );
            case 5:
              return (
                <TransactionButton
                  title="Finalize"
                  onClick={handleFinalize}
                  isPending={isFinalizing}
                  isDisabled={isFinalizing}
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
