"use client";

import { useEffect, useState } from "react";
import { PoolConfiguration, PoolCreation } from "./_components";
import type { NextPage } from "next";
import { CowAMM } from "~~/components/assets/CowAMM";
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
            <CowAMM width="333" />
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
