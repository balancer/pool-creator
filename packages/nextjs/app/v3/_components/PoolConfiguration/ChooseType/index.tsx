import React from "react";
import { PoolTypeButton } from "./PoolTypeButton";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function ChooseType() {
  // const { poolType } = usePoolCreationStore();

  const poolTypes = Object.keys(poolTypeMap) as SupportedPoolTypes[];

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10">
        <div className="flex flex-col gap-5">
          <div className="text-xl">Choose a pool type:</div>
          <div className="flex flex-col gap-4 px-24">
            {poolTypes.map((type: SupportedPoolTypes) => (
              <PoolTypeButton key={type} selectedPoolType={type} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
