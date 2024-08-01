import { useEffect, useState } from "react";
import Link from "next/link";
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
    setIsCreatingPool(true);
    const newPool = await createPool();
    setUserPoolAddress(newPool);
    setCurrentStep(2);
    setIsCreatingPool(false);
  };

  const handleApproveTokens = async () => {
    setIsApproving(true);
    const txs = [];
    if (token1.rawAmount > allowance1) txs.push(approve1(token1.rawAmount));
    if (token2.rawAmount > allowance2) txs.push(approve2(token2.rawAmount));
    await Promise.all(txs);
    refetchAllowance1();
    refetchAllowance2();
    setIsApproving(false);
  };

  const handleBindTokens = async () => {
    if (!token1.address || !token2.address) throw new Error("Must select tokens before binding");
    setIsBinding(true);
    await Promise.all([bind(token1.address, token1.rawAmount), bind(token2.address, token2.rawAmount)]);
    refetchPool();
    setIsBinding(false);
  };

  const handleSetSwapFee = async () => {
    if (!pool) throw new Error("Cannot set swap fee without a pool");
    setIsSettingSwapFee(true);
    await setSwapFee(pool.MAX_FEE);
    refetchPool();
    setIsSettingSwapFee(false);
  };

  const handleFinalize = async () => {
    setIsFinalizing(true);
    await finalize();
    refetchPool();
    setIsFinalizing(false);
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

  useEffect(() => {
    // If the user has no pools or their most recent pool is finalized
    if (userPoolAddress || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If the user has created a pool, but not finalized and tokens not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      if (allowance1 < token1.rawAmount || allowance2 < token2.rawAmount) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }
    }
    // If the user has a pool with 2 tokens binded, but it has not been finalized
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
    address,
    events,
    isLoadingEvents,
    pool?.isFinalized,
    pool?.getNumTokens,
    allowance1,
    allowance2,
    token1.rawAmount,
    token2.rawAmount,
  ]);

  // Must choose tokens and set amounts approve button is enabled
  const isApproveDisabled =
    token1.rawAmount === 0n || token1.address === undefined || token2.rawAmount === 0n || token2.address === undefined;
  // Determine if token allowances are sufficient
  const isSufficientAllowance =
    allowance1 >= token1.rawAmount && allowance2 >= token2.rawAmount && token1.rawAmount > 0n && token2.rawAmount > 0n;

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
      <StepsDisplay currentStep={currentStep} />

      <div className="min-w-96">
        {existingPool ? (
          <div className="text-lg text-red-400">
            A CoW AMM with selected tokens{" "}
            <Link
              className="link"
              rel="noopener noreferrer"
              target="_blank"
              href={`https://balancer.fi/pools/${existingPool.chain.toLowerCase()}/cow/${existingPool.address}`}
            >
              already exists!
            </Link>
          </div>
        ) : !userPoolAddress || pool?.isFinalized ? (
          <TransactionButton
            title="Create Pool"
            isPending={isCreatingPool}
            isDisabled={isCreatingPool || !token1.address || !token2.address || existingPool !== undefined}
            onClick={handleCreatePool}
          />
        ) : !isSufficientAllowance ? (
          <TransactionButton
            title="Approve"
            isPending={isApproving}
            isDisabled={isApproveDisabled || isApproving}
            onClick={handleApproveTokens}
          />
        ) : (pool?.getNumTokens || 0) < 2 ? (
          <TransactionButton
            title="Add Liquidity"
            isPending={isBinding}
            isDisabled={isBinding}
            onClick={handleBindTokens}
          />
        ) : pool?.MAX_FEE !== pool?.getSwapFee ? (
          <TransactionButton
            title="Set Swap Fee"
            onClick={handleSetSwapFee}
            isPending={isSettingFee}
            isDisabled={isSettingFee}
          />
        ) : (
          <TransactionButton
            title="Finalize"
            onClick={handleFinalize}
            isPending={isFinalizing}
            isDisabled={isFinalizing}
          />
        )}
      </div>
    </>
  );
};
