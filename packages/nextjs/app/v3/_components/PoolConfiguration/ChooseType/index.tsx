import React from "react";
import { PoolTypeButton } from "./PoolTypeButton";
import { usePoolCreationStore } from "~~/hooks/v3";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function ChooseType() {
  const poolTypes = Object.keys(poolTypeMap).slice(0, 3) as SupportedPoolTypes[];
  const { poolType } = usePoolCreationStore();

  console.log(poolTypeMap);

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 mt-10">
        <div className="text-xl">Choose a pool type:</div>
        <div className="grid grid-cols-3 gap-4 ">
          {poolTypes.map((type: SupportedPoolTypes) => (
            <PoolTypeButton key={type} selectedPoolType={type} />
          ))}
        </div>

        {poolType ? (
          <div className="text-xl bg-base-100 p-5 rounded-xl">{poolTypeMap[poolType].description}</div>
        ) : null}
      </div>
    </>
  );
}
