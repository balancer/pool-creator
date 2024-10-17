import React from "react";
import { PoolType } from "@balancer/sdk";
import { Checkbox, NumberInput, RadioInput, TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

const swapFeeButtonStyles =
  "bg-base-200 w-20 h-12 rounded-lg flex items-center justify-center hover:cursor-pointer hover:border-2 hover:border-base-content text-lg";

export const ChooseParameters = () => {
  const {
    isUsingHooks,
    poolType,
    amplificationParameter,
    swapFeePercentage,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    isDelegatingManagement,
    updatePool,
  } = usePoolCreationStore();

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "swapFeePercentage" | "amplificationParameter",
    min: number,
    max: number,
  ) => {
    const value = e.target.value;
    const numberValue = Number(value);

    if (numberValue < min) {
      updatePool({ [field]: min.toString() });
    } else if (numberValue > max) {
      updatePool({ [field]: max.toString() });
    } else {
      updatePool({ [field]: value });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-base-100 p-5 rounded-xl">
        <div className="text-lg font-bold mb-3">Swap Fee Percentage</div>

        <div className="flex gap-2">
          <div
            className={` ${swapFeePercentage === "0.1" ? "border-2 border-base-content" : ""} ${swapFeeButtonStyles} `}
            onClick={() => updatePool({ swapFeePercentage: "0.1" })}
          >
            0.1%
          </div>
          <div
            className={` ${swapFeePercentage === "0.3" ? "border-2 border-base-content" : ""} ${swapFeeButtonStyles} `}
            onClick={() => updatePool({ swapFeePercentage: "0.3" })}
          >
            0.3%
          </div>
          <div
            className={` ${swapFeePercentage === "1" ? "border-2 border-base-content" : ""} ${swapFeeButtonStyles} `}
            onClick={() => updatePool({ swapFeePercentage: "1" })}
          >
            1%
          </div>
          <div>
            <NumberInput
              placeholder=".001 - 10"
              value={swapFeePercentage}
              onChange={e => handleNumberInputChange(e, "swapFeePercentage", 0.001, 10)}
              min={0.001}
              max={10}
              step={0.001}
              isPercentage={true}
            />
          </div>
        </div>
      </div>

      {poolType === PoolType.Stable && (
        <div className="bg-base-100 p-5 rounded-xl">
          <div className="text-lg font-bold mb-3">Amplification Parameter</div>

          <div className="flex gap-2">
            <div
              className={` ${
                amplificationParameter === "1" ? "border-2 border-base-content" : ""
              } ${swapFeeButtonStyles} `}
              onClick={() => updatePool({ amplificationParameter: "1" })}
            >
              1
            </div>
            <div
              className={` ${
                amplificationParameter === "69" ? "border-2 border-base-content" : ""
              } ${swapFeeButtonStyles} `}
              onClick={() => updatePool({ amplificationParameter: "69" })}
            >
              69
            </div>
            <div
              className={` ${
                amplificationParameter === "420" ? "border-2 border-base-content" : ""
              } ${swapFeeButtonStyles} `}
              onClick={() => updatePool({ amplificationParameter: "420" })}
            >
              420
            </div>
            <div className="w-[135px]">
              <NumberInput
                placeholder="1 - 5000"
                value={amplificationParameter}
                onChange={e => handleNumberInputChange(e, "amplificationParameter", 1, 5000)}
                min={1}
                max={5000}
                step={1}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-base-100 p-5 rounded-xl">
        <label className="text-lg font-bold">Pool management</label>
        <RadioInput
          name="pool-management"
          label="Delegate swap and pause management to the Balancer DAO"
          checked={isDelegatingManagement}
          onChange={() => {
            updatePool({ isDelegatingManagement: true, swapFeeManager: "", pauseManager: "" });
          }}
        />
        <RadioInput
          name="pool-management"
          label="Choose a swap fee and pause manager"
          checked={!isDelegatingManagement}
          onChange={() => updatePool({ isDelegatingManagement: false })}
        />
        {!isDelegatingManagement && (
          <div className="flex gap-4 mt-3">
            <TextField
              label="Swap fee manager"
              placeholder="Enter address"
              value={swapFeeManager}
              onChange={e => updatePool({ swapFeeManager: e.target.value })}
            />
            <TextField
              label="Pause manager"
              placeholder="Enter address"
              value={pauseManager}
              onChange={e => updatePool({ pauseManager: e.target.value })}
            />
          </div>
        )}
      </div>

      <div className="bg-base-100 p-5 rounded-xl">
        <label className="text-lg font-bold">Pool hooks</label>
        <RadioInput
          name="pool-hooks"
          label="I do not want this pool to use any hooks"
          checked={!isUsingHooks}
          onChange={() => {
            updatePool({
              isUsingHooks: false,
              poolHooksContract: "",
              disableUnbalancedLiquidity: false,
              enableDonation: false,
            });
          }}
        />
        <RadioInput
          name="pool-hooks"
          label="I want this pool to use a hooks contract"
          checked={isUsingHooks}
          onChange={() => updatePool({ isUsingHooks: true })}
        />
        {isUsingHooks && (
          <div className="mt-3">
            <TextField
              label="Contract address"
              placeholder="Enter pool hooks contract address"
              value={poolHooksContract}
              onChange={e => updatePool({ poolHooksContract: e.target.value })}
            />
            <div className="mt-2 flex flex-col gap-2">
              <Checkbox
                label="Should this pool disable unbalanced liquidity operations?"
                checked={disableUnbalancedLiquidity}
                onChange={() => updatePool({ disableUnbalancedLiquidity: !disableUnbalancedLiquidity })}
              />
              <Checkbox
                label="Should this pool accept donations?"
                checked={enableDonation}
                onChange={() => updatePool({ enableDonation: !enableDonation })}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
