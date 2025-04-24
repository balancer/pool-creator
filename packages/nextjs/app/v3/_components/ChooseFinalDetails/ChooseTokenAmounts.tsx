import React from "react";
import { ChooseTokenAmount } from "./ChooseTokenAmount";
import { PoolType } from "@balancer/sdk";
import { Alert } from "~~/components/common";
import { usePoolCreationStore, useUserDataStore, useValidatePoolCreationInput } from "~~/hooks/v3";
import { sortTokenConfigs } from "~~/utils/helpers";

export function ChooseTokenAmounts() {
  const { tokenConfigs, poolType } = usePoolCreationStore();
  const { updateUserData, hasAgreedToWarning } = useUserDataStore();
  const { isValidTokenWeights } = useValidatePoolCreationInput();

  // Sorting token configs is necessary for consistent auto-fill of other token amount for gyro ECLP
  const sortedTokenConfigs = sortTokenConfigs(tokenConfigs);

  return (
    <div>
      <div className="text-xl mb-3">Choose initialization amounts:</div>
      <div className="flex flex-col gap-4">
        {sortedTokenConfigs.map((_, index) => (
          <ChooseTokenAmount key={index} index={index} />
        ))}
      </div>

      {!isValidTokenWeights && (
        <div className="mt-5">
          <Alert type="error">Each token weight must be at least 1% and sum of all weights must be 100%</Alert>
        </div>
      )}

      {poolType === PoolType.Weighted && (
        <div className="mt-5">
          <Alert type="warning">
            <label className="label cursor-pointer py-0 gap-3">
              <span className="font-bold">Please Confirm:</span> USD values of amounts are proportional to token
              weights?
              <input
                type="checkbox"
                className="checkbox rounded-lg border-neutral-700"
                onChange={() => {
                  updateUserData({ hasAgreedToWarning: !hasAgreedToWarning });
                }}
                checked={hasAgreedToWarning}
              />
            </label>
          </Alert>
        </div>
      )}
    </div>
  );
}
