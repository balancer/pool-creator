import React from "react";
import { ChooseToken } from "./ChooseToken";
import { PoolType } from "@balancer/sdk";
import { initialTokenConfig, usePoolCreationStore } from "~~/hooks/v3";

const MAX_TOKENS = {
  [PoolType.Weighted]: 8,
  [PoolType.Stable]: 4, // because Daniel said to "for the moment, even though it theoretically supports more"
};

export function ChooseTokens() {
  const { tokenConfigs, poolType, updatePool } = usePoolCreationStore();

  function handleAddToken() {
    const updatedTokenCount = tokenConfigs.length + 1;
    const updatedWeight = 100 / updatedTokenCount;
    const updatedPoolTokens = tokenConfigs.map(token => ({ ...token, weight: updatedWeight }));
    updatedPoolTokens.push({ ...initialTokenConfig, weight: updatedWeight });
    updatePool({ tokenConfigs: updatedPoolTokens });
  }

  return (
    <div>
      <div className="text-xl mb-5">Choose up to {poolType ? MAX_TOKENS[poolType] : 0} tokens:</div>

      <div className="flex flex-col gap-7">
        {Array.from({ length: tokenConfigs.length }).map((_, index) => (
          <ChooseToken key={index} index={index} />
        ))}
        {poolType && tokenConfigs.length < MAX_TOKENS[poolType] && (
          <div className="flex justify-end">
            <button onClick={handleAddToken} className="btn btn-primary border-none mt-5 w-40 rounded-xl text-lg flex">
              Add Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
