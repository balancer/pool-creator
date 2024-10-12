import React from "react";
import { PoolType } from "@balancer/sdk";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";

const POOL_TYPES: AllowedPoolTypes[] = [PoolType.Weighted, PoolType.Stable];

export const ChooseType = () => {
  const { poolType, setPoolType } = usePoolCreationStore();

  return (
    <div className="flex flex-col flex-grow justify-center h-full gap-5 px-10">
      {POOL_TYPES.map(type => (
        <button
          key={type}
          className={`${
            type === poolType ? `bg-accent text-white` : `shadow-md bg-primary`
          } font-bold py-5 w-full rounded-xl text-lg text-primary-content`}
          onClick={() => setPoolType(type)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};
