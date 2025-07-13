import React from "react";
import { usePoolCreationStore } from "~~/hooks/v3";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function PoolTypeButton({ selectedPoolType }: { selectedPoolType: SupportedPoolTypes }) {
  const { poolType, updatePool, tokenConfigs } = usePoolCreationStore();

  const maxNumberOfTokens = poolType ? poolTypeMap[selectedPoolType].maxTokens : 2;

  function handlePoolTypeSelection() {
    updatePool({ poolType: selectedPoolType, tokenConfigs: tokenConfigs.slice(0, maxNumberOfTokens) });
  }

  return (
    <button
      className={`${
        selectedPoolType === poolType ? `${selectedPoolStyles}` : `bg-base-100 ${hoverPoolStyles} shadow-lg`
      } p-2 w-full rounded-xl h-20`}
      onClick={handlePoolTypeSelection}
    >
      <div className="flex flex-col text-center">
        <div className="font-bold text-xl w-full">{poolTypeMap[selectedPoolType].label}</div>
      </div>
    </button>
  );
}

const selectedPoolStyles =
  "text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)]";

const hoverPoolStyles =
  "hover:bg-gradient-to-r hover:from-violet-300 hover:via-violet-200 hover:to-orange-300 hover:text-neutral-700 hover:opacity-80";
