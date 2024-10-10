import React from "react";
import { Checkbox, NumberInput, TextField } from "~~/components/common";
import { usePoolStore } from "~~/hooks/v3";

export const ChooseParameters = () => {
  const {
    swapFeePercentage,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
    donationsEnabled,
    disableUnbalancedLiquidity,
    setSwapFeePercentage,
    setSwapFeeManager,
    setPauseManager,
    setPoolHooksContract,
    setDonationsEnabled,
    setDisableUnbalancedLiquidity,
  } = usePoolStore();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="w-96">
          <NumberInput
            label="Swap fee ( 0.001% - 10% )"
            placeholder="Enter swap fee %"
            value={swapFeePercentage}
            onChange={e => setSwapFeePercentage(e.target.value)}
            min={0}
            max={10}
            step={0.001}
          />
        </div>
        <TextField
          label="Swap fee manager"
          placeholder="Enter address"
          value={swapFeeManager}
          onChange={e => setSwapFeeManager(e.target.value)}
        />
      </div>
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
          checked={donationsEnabled}
          onChange={() => setDonationsEnabled(!donationsEnabled)}
        />
      </div>
    </div>
  );
};
