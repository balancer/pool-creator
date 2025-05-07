import React from "react";
import { ChooseTokenAmount } from "./ChooseTokenAmount";
import { PoolType } from "@balancer/sdk";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Alert, TransactionButton } from "~~/components/common";
import { usePoolCreationStore, useUserDataStore, useValidateInitializationInputs } from "~~/hooks/v3";
import { sortTokenConfigs } from "~~/utils/helpers";

export function ChooseTokenAmounts({
  setIsChooseTokenAmountsModalOpen,
}: {
  setIsChooseTokenAmountsModalOpen: (isOpen: boolean) => void;
}) {
  const { tokenConfigs, poolType, updatePool, step } = usePoolCreationStore();
  const { updateUserData, hasAgreedToWarning } = useUserDataStore();

  // Sorting token configs is necessary for consistent auto-fill of other token amount for gyro ECLP
  const sortedTokenConfigs = sortTokenConfigs(tokenConfigs);

  const { isInitializePoolInputsValid } = useValidateInitializationInputs();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-[100]">
      <div className="bg-base-300 rounded-xl flex flex-col gap-7 p-7 min-w-[550px] relative">
        <button className="absolute top-4 right-4" onClick={() => setIsChooseTokenAmountsModalOpen(false)}>
          <XMarkIcon className="w-6 h-6" />
        </button>
        <div className="font-bold text-2xl text-center">Choose Token Amounts</div>
        <div className="flex flex-col gap-5 bg-base-100 p-4 rounded-xl">
          {sortedTokenConfigs.map((tokenConfig, index) => (
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

        <TransactionButton
          onClick={() => {
            updatePool({ step: step + 1 });
            setIsChooseTokenAmountsModalOpen(false);
          }}
          title="Confirm Amounts"
          isDisabled={!isInitializePoolInputsValid}
          isPending={false}
        />
      </div>
    </div>
  );
}
