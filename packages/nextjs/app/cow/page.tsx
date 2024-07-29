"use client";

import { useEffect, useState } from "react";
import { CreatePool, FinalizePool, InitializePool } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Address as ScaffoldAddress } from "~~/components/scaffold-eth";
import { useReadPool } from "~~/hooks/cow/";
import { useScaffoldEventHistory, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const CoW: NextPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userPools, setUserPools] = useState<string[]>([]);

  const { address } = useAccount();

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

  const newestPool = userPools[0];

  const { data: pool, isLoading, isError } = useReadPool(newestPool);
  console.log("isLoading", isLoading);
  console.log("isError", isError);

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

  // Add user created pools to state
  useEffect(() => {
    if (!isLoadingEvents && events) {
      const pools = events.map(e => e.args.bPool).filter((pool): pool is string => pool !== undefined);
      setUserPools(pools);
    }
  }, [!isLoadingEvents && events]);

  // Manage the steps progress
  useEffect(() => {
    // If the user has no pools or your most recent pool is finalized
    if (userPools.length === 0 || pool?.isFinalized) {
      setCurrentStep(1);
    }
    // If the user has created a pool, but it is not finalized and the tokens are not binded
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens < 2n) {
      setCurrentStep(2);
    }
    // If the user has a pool with 2 tokens binded, but it has not been finalized
    if (pool !== undefined && !pool.isFinalized && pool.getNumTokens === 2n) {
      setCurrentStep(3);
    }
  }, [pool, address, events, isLoadingEvents]);

  return (
    <div className="flex-grow">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 bg-base-200">
          <h1 className="text-5xl font-bold my-5">CoW AMMs</h1>

          <p className="text-2xl mb-7">Create and initialize two token (50/50) pools with a max swap fee (99.99%)</p>

          <ul className="steps steps-vertical md:steps-horizontal md:w-[700px] mb-10">
            <li className="step step-accent">Create Pool</li>
            <li className={`step ${currentStep > 1 && "step-accent"}`}>Initialize Pool</li>
            <li className={`step ${currentStep > 2 && "step-accent"}`}>Finalize Pool</li>
          </ul>

          <div className="bg-base-300 p-7 rounded-xl w-[555px]">
            {currentStep === 1 && <CreatePool />}
            {currentStep === 2 && <InitializePool pool={newestPool} />}
            {currentStep === 3 && <FinalizePool pool={pool} />}
          </div>

          {newestPool && (
            <div className="mt-5">
              <ScaffoldAddress size="xl" address={newestPool} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoW;
