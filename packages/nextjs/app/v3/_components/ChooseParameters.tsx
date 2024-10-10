import React from "react";
import { PoolType } from "@balancer/sdk";
import { Checkbox, NumberInput, TextField } from "~~/components/common";
import { usePoolStore } from "~~/hooks/v3";

export const ChooseParameters = () => {
  const {
    poolType,
    amplificationParameter,
    swapFeePercentage,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
    enableDonation,
    disableUnbalancedLiquidity,
    setSwapFeePercentage,
    setAmplificationParameter,
    setSwapFeeManager,
    setPauseManager,
    setPoolHooksContract,
    setEnableDonation,
    setDisableUnbalancedLiquidity,
  } = usePoolStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <NumberInput
          label="Swap fee ( 0.001% - 10% )"
          placeholder="Enter swap fee %"
          value={swapFeePercentage}
          onChange={e => setSwapFeePercentage(e.target.value)}
          min={0}
          max={10}
          step={0.001}
        />
        {poolType === PoolType.Stable && (
          <NumberInput
            label="Amplification Parameter ( 1 - 5000 )"
            placeholder="Enter Amplification Parameter"
            value={amplificationParameter}
            onChange={e => setAmplificationParameter(e.target.value)}
            min={1}
            max={5000}
            step={1}
          />
        )}
      </div>
      <TextField
        label="Swap fee manager"
        placeholder="Enter address"
        value={swapFeeManager}
        onChange={e => setSwapFeeManager(e.target.value)}
      />
      <TextField
        label="Pause manager"
        placeholder="Enter address"
        value={pauseManager}
        onChange={e => setPauseManager(e.target.value)}
      />
      <TextField
        label="Pool hooks contract"
        placeholder="Enter address (optional)"
        value={poolHooksContract}
        onChange={e => setPoolHooksContract(e.target.value)}
      />
      <div className="grid grid-cols-2 gap-5">
        <Checkbox
          label="Disable Unbalanced Liquidity"
          checked={disableUnbalancedLiquidity}
          onChange={() => setDisableUnbalancedLiquidity(!disableUnbalancedLiquidity)}
        />
        <Checkbox
          label="Enable Donations"
          checked={enableDonation}
          onChange={() => setEnableDonation(!enableDonation)}
        />
      </div>
    </div>
  );
};
