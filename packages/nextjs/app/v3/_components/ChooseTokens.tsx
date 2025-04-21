import React from "react";
import { ChooseToken } from "./ChooseToken";
import { PoolType } from "@balancer/sdk";
import { PlusIcon } from "@heroicons/react/24/outline";
import { initialTokenConfig, usePoolCreationStore } from "~~/hooks/v3";

const MAX_TOKENS = {
  [PoolType.Weighted]: 8,
  [PoolType.Stable]: 4, // because Daniel said to "for the moment, even though it theoretically supports more"
  [PoolType.StableSurge]: 4,
  [PoolType.GyroE]: 2, // GyroECLP supports only 2 tokens
  [PoolType.ReClamm]: 2,
};

export function ChooseTokens() {
  const { tokenConfigs, poolType, updatePool } = usePoolCreationStore();

  function handleAddToken() {
    updatePool({ tokenConfigs: [...tokenConfigs, { ...initialTokenConfig }] });
  }

  return (
    <div className="flex flex-col flex-grow gap-6">
      <div className="flex justify-between items-center">
        <div className="text-xl">Choose up to {poolType ? MAX_TOKENS[poolType] : 0} tokens:</div>
        {poolType && tokenConfigs.length < MAX_TOKENS[poolType] && (
          <button onClick={handleAddToken} className="btn btn-primary border-none w-40 rounded-xl text-lg flex">
            Add Token
            <PlusIcon className="w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {Array.from({ length: tokenConfigs.length }).map((_, index) => (
          <ChooseToken key={index} index={index} />
        ))}
      </div>
    </div>
  );
}
