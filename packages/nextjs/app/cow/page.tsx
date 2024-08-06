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
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 gap-7">
          <h1 className="text-2xl md:text-4xl font-bold">Create a CoW AMM Pool</h1>
          {!persistedState && <PoolConfiguration />}
          {persistedState && <PoolCreation state={persistedState} clearState={clearPersistedState} />}
        </div>
      </div>
    </div>
  );
};

export default CowAmm;
