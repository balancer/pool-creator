import React from "react";
import { bgPrimaryGradient, bgPrimaryGradientHover } from "~~/utils";

export const ChoosePoolType = ({
  poolType,
  setPoolType,
}: {
  poolType: string | undefined;
  setPoolType: (type: string) => void;
}) => {
  return (
    <>
      <div className="mb-5">Choose a pool type:</div>
      <button
        className={`${
          poolType === "Weighted" ? bgPrimaryGradient + " text-neutral-700" : "bg-base-300"
        } ${bgPrimaryGradientHover} hover:text-neutral-700 font-bold shadow-inner py-5 w-full rounded-xl`}
        onClick={() => setPoolType("Weighted")}
      >
        Weighted
      </button>
    </>
  );
};
