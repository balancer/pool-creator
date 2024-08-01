import { useEffect, useState } from "react";
import Link from "next/link";
import { StepsDisplay } from "./StepsDisplay";
import { Address, parseEventLogs } from "viem";
import { useAccount } from "wagmi";
import { usePublicClient } from "wagmi";
import { TransactionButton } from "~~/components/common/";
import { abis } from "~~/contracts/abis";
import { useFetchExistingPools, useReadPool, useWritePool } from "~~/hooks/cow/";
import {
  useScaffoldEventHistory,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";
import { useReadToken, useWriteToken } from "~~/hooks/token";

type TokenInput = {
  rawAmount: bigint;
  address: Address | undefined;
};

export const CreatePool = ({
  name,
  symbol,
  token1,
  token2,
}: {
  name: string;
  symbol: string;
  token1: TokenInput;
  token2: TokenInput;
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPoolAddress, setUserPoolAddress] = useState<string>();

  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const [isSettingFee, setIsSettingFee] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: pool, refetch: refetchPool } = useReadPool(userPoolAddress);
  const { data: existingPools } = useFetchExistingPools();

  const { allowance: allowance1, refetchAllowance: refetchAllowance1 } = useReadToken(token1?.address, pool?.address);
  const { allowance: allowance2, refetchAllowance: refetchAllowance2 } = useReadToken(token2?.address, pool?.address);
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");
  const { approve: approve1 } = useWriteToken(token1?.address, pool?.address);
  const { approve: approve2 } = useWriteToken(token2?.address, pool?.address);
  const { bind, setSwapFee, finalize } = useWritePool(pool?.address);

  const createPool = async () => {
    console.log("name", name);
    console.log("symbol", symbol);
    try {
      setIsCreatingPool(true);
      const hash = await bCoWFactory({
        functionName: "newBPool",
      });
      setCurrentStep(2);
      if (publicClient && hash) {
        const txReceipt = await publicClient.getTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi: abis.CoW.BCoWFactory,
          logs: txReceipt.logs,
        });
        const newPool = (logs[0].args as { caller: string; bPool: string }).bPool;
        console.log("New pool address from txReceipt logs:", newPool);
        setUserPoolAddress(newPool);
      }
      setIsCreatingPool(false);
    } catch (e) {
      console.error("Error creating pool", e);
      setIsCreatingPool(false);
    }
  };

  const handleApprovals = async () => {
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
    try {
      setIsSettingFee(true);
      await setSwapFee(pool.MAX_FEE);
      setIsSettingFee(false);
      refetchPool();
    } catch (e) {
      console.error("Error setting swap fee", e);
      setIsSettingFee(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      await finalize();
      setIsFinalizing(false);
      refetchPool();
    } catch (e) {
      console.error("Error finalizing pool", e);
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

  useEffect(() => {
    // If the user has no pools or their most recent pool is finalized
    if (userPoolAddress || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If the user has created a pool, but it is not finalized and the tokens are not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      setCurrentStep(2);
    }
    // If the user has a pool with 2 tokens binded, but it has not been finalized
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens === 2n) {
      if (pool.getSwapFee !== pool.MAX_FEE) {
        setCurrentStep(3);
      } else {
        setCurrentStep(4);
      }
    }
  }, [pool, address, events, isLoadingEvents, userPoolAddress, pool?.isFinalized, pool?.getNumTokens]);

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
            onClick={createPool}
          />
        ) : !isSufficientAllowance ? (
          <TransactionButton
            title="Approve"
            isPending={isApproving}
            isDisabled={isApproveDisabled || isApproving}
            onClick={handleApprovals}
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
