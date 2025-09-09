import React from "react";
import { ChooseTokenAmount } from "./ChooseTokenAmount";
import { PoolType } from "@balancer/sdk";
import { Alert } from "~~/components/common";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmounts() {
  const { tokenConfigs, poolType } = usePoolCreationStore();
  const { updateUserData, hasAgreedToWarning } = useUserDataStore();

  return (
    <div className="rounded-xl flex flex-col bg-base-100 p-4">
      <div className="text-xl mb-3">Choose Token Amounts:</div>
      <div className="flex flex-col gap-5 rounded-xl">
        {tokenConfigs.map((tokenConfig, index) => (
          <ChooseTokenAmount key={tokenConfig.address} index={index} tokenConfig={tokenConfig} />
        ))}
      </div>

      {poolType === PoolType.Weighted && (
        <Alert type="warning">
          <label className="label cursor-pointer py-0 gap-3">
            <span className="font-bold">Please Confirm:</span> USD values are proportional to token weights?
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
      )}
    </div>
  );
}
