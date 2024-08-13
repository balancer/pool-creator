"use client";

import { useEffect, useState } from "react";
import { PoolCreation } from "./_components";
import type { NextPage } from "next";
import { PoolConfiguration } from "~~/app/cow/_components/PoolConfiguration";
import { usePoolCreationPersistedState } from "~~/hooks/cow/usePoolCreationState";

const CowAmm: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  const persistedState = usePoolCreationPersistedState(state => state.state);
  const clearPersistedState = usePoolCreationPersistedState(state => state.clearPersistedState);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex-grow bg-base-300">
      <div className="flex justify-center px-5">
        <div className="w-full md:w-[555px]">
          <div className="flex items-center flex-col flex-grow py-14 gap-6">
            <h1 className="text-2xl md:text-4xl font-bold">Create a CoW AMM</h1>
            {!isMounted ? (
              <CowLoadingSkeleton />
            ) : !persistedState ? (
              <PoolConfiguration />
            ) : (
              persistedState && <PoolCreation state={persistedState} clearState={clearPersistedState} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CowAmm;

const CowLoadingSkeleton = () => {
  return (
    <>
      <div className="w-full h-[562px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
      <div className="w-full h-[75px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
    </>
  );
};
