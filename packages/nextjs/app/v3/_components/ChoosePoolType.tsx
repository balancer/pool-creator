import React from "react";
import { PoolType } from "../types";

export const ChoosePoolType = ({
  poolType,
  setPoolType,
}: {
  poolType: PoolType;
  setPoolType: (type: PoolType) => void;
}) => {
  return (
    <>
      <div className="mb-5 text-lg font-bold">Choose pool type:</div>
      <button
        className={`${
          poolType === "Weighted"
            ? "bg-accent text-white" + ""
            : "shadow-md bg-base-300  hover:bg-accent hover:text-white"
        } font-bold py-5 w-full rounded-xl`}
        onClick={() => setPoolType("Weighted")}
      >
        Weighted
      </button>
    </>
  );
};
