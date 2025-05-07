import React from "react";
import { ChooseToken } from "./ChooseToken";
import { PlusIcon } from "@heroicons/react/24/outline";
import { Alert } from "~~/components/common";
import { initialTokenConfig, usePoolCreationStore } from "~~/hooks/v3";
import { useValidateCreationInputs } from "~~/hooks/v3";
import { poolTypeMap } from "~~/utils/constants";

export function ChooseTokens() {
  const { tokenConfigs, poolType, updatePool } = usePoolCreationStore();
  const { isValidTokenWeights } = useValidateCreationInputs();

  const maxNumberOfTokens = poolType ? poolTypeMap[poolType].maxTokens : 2;

  function handleAddToken() {
    // keep weight math simple by clearing weights if user adds tokens
    const updatedTokenConfigs = tokenConfigs.map(token => ({
      ...token,
      weight: token.isWeightLocked ? token.weight : "",
    }));
    updatePool({ tokenConfigs: [...updatedTokenConfigs, { ...initialTokenConfig }] });
  }

  return (
    <div className="flex flex-col flex-grow gap-6">
      <div className="flex justify-between items-center">
        <div className="text-xl">Choose up to {maxNumberOfTokens} tokens:</div>
        {poolType && tokenConfigs.length < maxNumberOfTokens && (
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

      {!isValidTokenWeights && (
        <Alert type="error">Minimum token weight is 1% and sum of all token weights must be 100%</Alert>
      )}
    </div>
  );
}
