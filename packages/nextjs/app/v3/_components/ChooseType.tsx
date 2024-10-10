import React from "react";
import { PoolType } from "../../../hooks/v3/types";
import { usePoolStore } from "~~/hooks/v3";

const POOL_TYPES = ["Weighted", "Stable"];

export const ChooseType = () => {
  const { type, setType } = usePoolStore();

  return (
    <div className="flex flex-col flex-grow justify-center h-full gap-5 px-10">
      {POOL_TYPES.map(poolType => (
        <button
          key={poolType}
          className={`${
            poolType === type ? `bg-accent text-white` : `shadow-md bg-primary`
          } font-bold py-5 w-full rounded-xl text-primary-content`}
          onClick={() => setType(poolType as PoolType)}
        >
          {poolType}
        </button>
      ))}
    </div>
  );
};
