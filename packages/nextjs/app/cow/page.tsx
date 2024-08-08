"use client";

import { PoolCreation } from "./_components";
import type { NextPage } from "next";
import { PoolConfiguration } from "~~/app/cow/_components/PoolConfiguration";
import { usePoolCreationPersistedState } from "~~/hooks/cow/usePoolCreationState";

const CowAmm: NextPage = () => {
  const persistedState = usePoolCreationPersistedState(state => state.state);
  const clearPersistedState = usePoolCreationPersistedState(state => state.clearPersistedState);

  return (
    <div className="flex-grow bg-base-300">
      <div className="flex justify-center px-5">
        <div className="w-full sm:w-[555px]">
          <div className="flex items-center flex-col flex-grow py-10 gap-6">
            <h1 className="text-2xl md:text-4xl font-bold">Create a CoW AMM Pool</h1>
            {!persistedState && <PoolConfiguration />}
            {persistedState && <PoolCreation state={persistedState} clearState={clearPersistedState} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CowAmm;
