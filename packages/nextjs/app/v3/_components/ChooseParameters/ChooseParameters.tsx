import React from "react";
import {
  AmplificationParameter,
  EclpParams,
  HandleNumberInputChange,
  LiquidityManagement,
  PauseManager,
  PoolHooks,
  ReClammParams,
  SwapFeeManger,
  SwapFeePercentage,
} from "./";
import { PoolType } from "@balancer/sdk";
import { usePoolCreationStore } from "~~/hooks/v3";

export const ChooseParameters = () => {
  const { poolType, updatePool } = usePoolCreationStore();

  const handleNumberInputChange: HandleNumberInputChange = (e, field, min, max) => {
    const value = e.target.value;

    if (value === "") {
      updatePool({ [field]: "" });
      return;
    }

    const numberValue = Number(value);

    if (numberValue !== 0 && numberValue < min) {
      updatePool({ [field]: min.toString() });
    } else if (numberValue > max) {
      updatePool({ [field]: max.toString() });
    } else {
      if (field === "amplificationParameter") {
        updatePool({ [field]: Math.round(numberValue).toString() });
      } else {
        updatePool({ [field]: value.toString() });
      }
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl">Choose pool parameters:</div>

      {poolType === PoolType.GyroE && <EclpParams />}
      {poolType === PoolType.ReClamm && <ReClammParams />}
      {(poolType === PoolType.Stable || poolType === PoolType.StableSurge) && (
        <AmplificationParameter handleNumberInputChange={handleNumberInputChange} />
      )}
      <SwapFeePercentage handleNumberInputChange={handleNumberInputChange} />
      <SwapFeeManger />
      <PauseManager />
      <PoolHooks />
      <LiquidityManagement />
    </div>
  );
};
