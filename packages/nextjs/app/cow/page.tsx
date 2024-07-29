"use client";

import { useEffect, useState } from "react";
import { ChooseTokens, CreatePool } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useCowPool } from "~~/hooks/cow/";
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

  const { data: pool, isLoading, isError } = useCowPool(newestPool);
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
    // If all of the user's pools are already finalized, set the current step to 1

    // If the user has no pools, set the current step to 1
    if (userPools.length === 0) {
      setCurrentStep(1);
    }
    if (pool !== undefined) {
      setCurrentStep(2);
    }
  }, [pool, address, events, isLoadingEvents]);

  return (
    <div className="flex-grow">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 bg-base-200">
          <h1 className="text-5xl font-bold my-5">CoW AMMs</h1>

          <p className="text-xl mb-7">Create and initialize two token (50/50) pools with a max swap fee (99.99%)</p>

          <ul className="steps steps-vertical md:steps-horizontal md:w-[700px] mb-10">
            <li className="step step-accent">Create Pool</li>
            <li className={`step ${currentStep === 2 && "step-accent"}`}>Approve Tokens</li>
            <li className="step">Bind Tokens</li>
            <li className="step">Set Swap Fees</li>
            <li className="step">Finalize Pool</li>
          </ul>

          <div className="bg-base-300 p-10 rounded-xl">
            {currentStep === 1 && <CreatePool />}
            {currentStep > 1 && <ChooseTokens address={newestPool} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoW;
