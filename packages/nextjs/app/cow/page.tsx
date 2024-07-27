"use client";

import { useEffect, useState } from "react";
import { ChooseTokens, CreatePool } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldEventHistory, useScaffoldWatchContractEvent } from "~~/hooks/scaffold-eth";

const CoW: NextPage = () => {
  //   const [currentStep, setCurrentStep] = useState(1);
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
  }, [!isLoadingEvents && events]);

  const newPool = userPools[0];

  return (
    <div className="flex-grow">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 bg-base-200">
          <h1 className="text-5xl font-bold my-5">CoW AMM</h1>

          <p className="text-xl mb-7">Create and initialize 50/50 weighted CoW AMMs</p>

          <ul className="steps steps-vertical md:steps-horizontal md:w-[700px]">
            <li className="step step-accent">Create Pool</li>
            <li className="step">Approve Tokens</li>
            <li className="step">Bind Tokens</li>
            <li className="step">Set Swap Fees</li>
            <li className="step">Finalize Pool</li>
          </ul>

          <CreatePool />
          <ChooseTokens address={newPool} />
        </div>
      </div>
    </div>
  );
};

export default CoW;
