import React from "react";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { usePoolCreationStore } from "~~/hooks/v3";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function ChooseType() {
  const { poolType } = usePoolCreationStore();

  const poolTypes = Object.keys(poolTypeMap) as SupportedPoolTypes[];
  const firstRowTypes = poolTypes.slice(0, 3);
  const secondRowTypes = poolTypes.slice(3, 5);

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 px-7 py-5">
        <div className="flex flex-col gap-5">
          <div className="grid grid-cols-3 gap-5">
            {firstRowTypes.map((type: SupportedPoolTypes) => (
              <PoolTypeButton key={type} selectedPoolType={type} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-5 justify-center">
            {secondRowTypes.map(type => (
              <PoolTypeButton key={type} selectedPoolType={type} />
            ))}
          </div>
        </div>

        <div>
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral h-32 flex flex-col justify-center">
            {poolType ? poolTypeMap[poolType].description : staringInstructions}
          </div>
        </div>
      </div>
    </>
  );
}

function PoolTypeButton({ selectedPoolType }: { selectedPoolType: SupportedPoolTypes }) {
  const { poolType, updatePool, tokenConfigs } = usePoolCreationStore();

  const maxNumberOfTokens = poolType ? poolTypeMap[selectedPoolType].maxTokens : 0;

  function handlePoolTypeSelection() {
    console.log("handlePoolTypeSelection", selectedPoolType, maxNumberOfTokens);
    updatePool({ poolType: selectedPoolType, tokenConfigs: tokenConfigs.slice(0, maxNumberOfTokens) });
  }

  return (
    <button
      className={`${
        selectedPoolType === poolType ? `${selectedPoolStyles}` : `bg-base-100 ${hoverPoolStyles} shadow-lg`
      } p-4 w-full rounded-xl`}
      onClick={handlePoolTypeSelection}
    >
      <div className="flex flex-col text-center">
        <div className="font-bold text-xl w-full">{poolTypeMap[selectedPoolType].label}</div>
      </div>
    </button>
  );
}

const staringInstructions = (
  <div>
    Begin by selecting the type of pool you wish to create. For more information about pool types, check out our{" "}
    <a
      href="https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/"
      className="link inline-flex items-center gap-1"
      target="_blank"
      rel="noreferrer"
    >
      docs
      <ArrowUpRightIcon className="w-3.5 h-3.5" />
    </a>
  </div>
);

const selectedPoolStyles =
  "text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)]";

const hoverPoolStyles =
  "hover:bg-gradient-to-r hover:from-violet-300 hover:via-violet-200 hover:to-orange-300 hover:text-neutral-700 hover:opacity-80";
