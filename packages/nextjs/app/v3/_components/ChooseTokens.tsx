import React from "react";
import { ChooseToken } from "./ChooseToken";
import { PoolType } from "@balancer/sdk";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Alert } from "~~/components/common";
import { initialTokenConfig, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

const MAX_TOKENS = {
  [PoolType.Weighted]: 8,
  [PoolType.Stable]: 4, // because Daniel said to "for the moment, even though it theoretically supports more"
};

export function ChooseTokens() {
  const { tokenConfigs, poolType, updatePool } = usePoolCreationStore();
  const { hasAgreedToWarning, updateUserData } = useUserDataStore();

  // Beware of javascript floating point precision issues if 100 % number of tokens is not equal to zero
  function handleAddToken() {
    // Count unlocked tokens (including the new one we're adding)
    const unlockedTokenCount = tokenConfigs.filter(token => !token.isWeightLocked).length + 1;

    // Calculate remaining weight to distribute (100 minus sum of locked weights)
    const lockedWeightSum = tokenConfigs.reduce((sum, token) => (token.isWeightLocked ? sum + token.weight : sum), 0);
    const remainingWeight = 100 - lockedWeightSum;

    // Calculate base weight for unlocked tokens
    const baseWeight = Math.floor(remainingWeight / unlockedTokenCount);
    const remainder = remainingWeight - baseWeight * unlockedTokenCount;

    // Update tokens, preserving locked weights
    const updatedPoolTokens = tokenConfigs.map(token => ({
      ...token,
      weight: token.isWeightLocked ? token.weight : baseWeight,
    }));

    // Add the new token with any remaining weight
    updatedPoolTokens.push({
      ...initialTokenConfig,
      weight: baseWeight + remainder,
    });

    updatePool({ tokenConfigs: updatedPoolTokens });
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

      {poolType === PoolType.Weighted && (
        <Alert type="warning" showIcon={false}>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-4 m-0 p-0">
              <input
                type="checkbox"
                className="checkbox rounded-lg border-neutral-700"
                onChange={() => {
                  updateUserData({ hasAgreedToWarning: !hasAgreedToWarning });
                }}
                checked={hasAgreedToWarning}
              />
              <span className="">
                I understand that assets should be added proportional to the chosen token weights
              </span>
            </label>
          </div>
        </Alert>
      )}

      {/* {!isProportional && <Alert type="warning">Token USD values are not proportional to selected weights</Alert>} */}
    </div>
  );
}
