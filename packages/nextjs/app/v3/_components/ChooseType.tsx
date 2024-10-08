import React from "react";
import { PoolType } from "../types";

const POOL_TYPES = ["Weighted", "Stable"];

export const ChooseType = ({
  poolType,
  setPoolType,
}: {
  poolType: PoolType;
  setPoolType: (type: PoolType) => void;
}) => {
  return (
    <div className="flex flex-col gap-5 px-10">
      {POOL_TYPES.map(type => (
        <button
          key={type}
          className={`${
            poolType === type
              ? "bg-accent text-white" + ""
              : "shadow-md bg-primary text-primary-content  hover:bg-accent hover:text-white"
          } font-bold py-5 w-full rounded-xl`}
          onClick={() => setPoolType(type as PoolType)}
        >
          {type}
        </button>
      ))}
    </div>
  );
};
