"use client";

import { useEffect, useState } from "react";
// import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { Pool } from "~~/components/cow/";
import {
  useScaffoldEventHistory,
  useScaffoldWatchContractEvent,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

const Home: NextPage = () => {
  const [userPools, setUserPools] = useState<string[]>([]);
  const { writeContractAsync: createPool } = useScaffoldWriteContract("BCoWFactory");

  const newBPool = async () => {
    try {
      await createPool({
        functionName: "newBPool",
      });
    } catch (e) {
      console.error("Error creating pool", e);
    }
  };
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
        const { bPool } = log.args;
        if (bPool) {
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

  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 bg-base-300 px-5 lg:px-10">
          <h1 className="text-5xl font-bold my-5">Scaffold CoW</h1>

          <p className="text-xl">Create and initialize 50/50 weighted CoW AMMs</p>

          <div className="my-10">
            <h3 className="text-3xl font-bold mb-7">Create New BPool</h3>
            <div className="flex justify-center">
              <button className="btn btn-accent" onClick={newBPool}>
                Create
              </button>
            </div>
          </div>
          <div className="my-10">
            <h3 className="text-3xl font-bold mb-7">Your BPools</h3>
            {userPools.map(pool => (
              <div key={pool}>
                <Pool address={pool} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
