import React from "react";
import { PoolTypeButton } from "./PoolTypeButton";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function ChooseType() {
  const poolTypes = Object.keys(poolTypeMap) as SupportedPoolTypes[];

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10">
        <div className="flex flex-col gap-5">
          <div className="text-xl mt-10">Choose a pool type:</div>
          <div className="grid grid-cols-2 gap-4">
            {poolTypes.slice(3, 4).map((type: SupportedPoolTypes) => (
              <PoolTypeButton key={type} selectedPoolType={type} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
