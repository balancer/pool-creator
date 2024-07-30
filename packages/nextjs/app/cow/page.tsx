"use client";

import { useEffect, useState } from "react";
import { CreatePool, FinalizePool, InitializePool, StepTracker } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useReadPool } from "~~/hooks/cow/";
import { useScaffoldEventHistory, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const CoW: NextPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPools, setUserPools] = useState<string[]>([]);

  const { address } = useAccount();
  const newestPool = userPools[0];

  const { data: pool, isLoading: isPoolLoading, isError: isPoolError, refetch: refetchPool } = useReadPool(newestPool);

  const {
    data: events,
    isLoading: isLoadingEvents,
    // error: errorReadingEvents,
  } = useScaffoldEventHistory({
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
          setUserPools(pools => [...pools, bPool]);
        }
      });
    },
  });

  useEffect(() => {
    if (!isLoadingEvents && events) {
      const pools = events.map(e => e.args.bPool).filter((pool): pool is string => pool !== undefined);
      setUserPools(pools);
    }
  }, [isLoadingEvents, events]);

  useEffect(() => {
    // If the user has no pools or their most recent pool is finalized
    if (userPools.length === 0 || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If the user has created a pool, but it is not finalized and the tokens are not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      setCurrentStep(2);
    }
    // If the user has a pool with 2 tokens binded, but it has not been finalized
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens === 2n) {
      if (pool.getSwapFee !== pool.MAX_FEE) {
        setCurrentStep(4);
      } else {
        setCurrentStep(5);
      }
    }
  }, [pool, address, events, isLoadingEvents, userPools.length, pool?.isFinalized, pool?.getNumTokens]);

  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 gap-7">
          <h1 className="text-5xl font-bold">CoW AMMs</h1>

          <div className="text-2xl mb-3">
            Create two token pools with a 50/50 weight distribution and a max swap fee of 99.99%
          </div>

          {isPoolLoading ? (
            <div>...</div>
          ) : isPoolError ? (
            <div>Error fetching pool</div>
          ) : (
            <>
              <div className="bg-base-200 p-7 rounded-xl w-[555px] min-h-[450px] flex flex-grow">
                {currentStep === 1 && <CreatePool setCurrentStep={setCurrentStep} />}
                {pool && (currentStep === 2 || currentStep === 3) && (
                  <InitializePool pool={pool} setCurrentStep={setCurrentStep} refetchPool={refetchPool} />
                )}
                {pool && currentStep > 3 && <FinalizePool pool={pool} refetchPool={refetchPool} />}
              </div>

              <StepTracker currentStep={currentStep} />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoW;