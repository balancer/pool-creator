import React from "react";
import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Checkbox, NumberInput, RadioInput, TextField } from "~~/components/common";
import { type HookFlags, usePoolCreationStore } from "~~/hooks/v3";

const swapFeePercentages = ["0.1", "0.3", "1"];
const amplificationParameters = ["10", "100", "1000"];

export const ChooseParameters = () => {
  const { address: connectedWalletAddress } = useAccount();

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
    isDelegatingPauseManagement,
    isDelegatingSwapFeeManagement,
    updatePool,
  } = usePoolCreationStore();

  const queryClient = useQueryClient();
  const hookFlags: HookFlags | undefined = queryClient.getQueryData(["validatePoolHooks", poolHooksContract]);

  const handleNumberInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "swapFeePercentage" | "amplificationParameter",
    min: number,
    max: number,
  ) => {
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

  const MIN_SWAP_FEE_PERCENTAGE = poolType === PoolType.Stable ? 0.0001 : 0.001;
  const SWAP_FEE_LINK =
    poolType === PoolType.Stable
      ? "https://docs-v3.balancer.fi/developer-reference/contracts/vault-config.html#minimum-swap-fee-percentage-1"
      : "https://docs-v3.balancer.fi/developer-reference/contracts/vault-config.html#minimum-swap-fee-percentage";

  return (
    <div className="flex flex-col gap-4">
      <div className="text-xl">Choose pool parameters:</div>
      <div className="bg-base-100 p-5 rounded-xl">
        <div className="text-lg font-bold mb-3 inline-flex">
          <a
            className="flex items-center gap-2 link no-underline hover:underline"
            href={SWAP_FEE_LINK}
            target="_blank"
            rel="noreferrer"
          >
            Swap fee percentage
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
          </a>
        </div>
        <div className="flex gap-2">
          {swapFeePercentages.map(fee => (
            <NumberParameterButton
              key={fee}
              value={fee}
              selectedValue={swapFeePercentage}
              onClick={() => updatePool({ swapFeePercentage: fee })}
              isPercentage={true}
            />
          ))}
          <div>
            <NumberInput
              placeholder={`${MIN_SWAP_FEE_PERCENTAGE} - 10`}
              value={swapFeePercentage}
              onChange={e => handleNumberInputChange(e, "swapFeePercentage", MIN_SWAP_FEE_PERCENTAGE, 10)}
              min={MIN_SWAP_FEE_PERCENTAGE}
              max={10}
              step={MIN_SWAP_FEE_PERCENTAGE}
              isPercentage={true}
            />
          </div>
        </div>
      </div>

      {(poolType === PoolType.Stable || poolType === PoolType.StableSurge) && (
        <div className="bg-base-100 p-5 rounded-xl">
          <div className="text-lg font-bold mb-3 inline-flex">
            <a
              className="flex items-center gap-2 link no-underline hover:underline"
              href="https://docs-v3.balancer.fi/developer-reference/contracts/vault-config.html#minimum-maximum-amplification-parameter"
              target="_blank"
              rel="noreferrer"
            >
              Amplification Parameter
              <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
            </a>
          </div>

          <div className="flex gap-2 items-end">
            {amplificationParameters.map(value => (
              <NumberParameterButton
                key={value}
                value={value}
                selectedValue={amplificationParameter}
                onClick={() => updatePool({ amplificationParameter: value })}
                isPercentage={false}
              />
            ))}
            <div className="w-[135px]">
              <NumberInput
                placeholder="1 - 5000"
                value={amplificationParameter}
                onChange={e => handleNumberInputChange(e, "amplificationParameter", 0, 5000)}
                min={1}
                max={5000}
                step={1}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-base-100 p-5 rounded-xl">
        <label className="text-lg font-bold inline-flex">
          <a
            className="flex items-center gap-2 link no-underline hover:underline"
            href="https://docs-v3.balancer.fi/concepts/core-concepts/pool-role-accounts.html"
            target="_blank"
            rel="noreferrer"
          >
            Swap fee manager
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
          </a>
        </label>
        <RadioInput
          name="swap-fee-manager"
          label="Delegate swap fee management to the Balancer DAO"
          checked={isDelegatingSwapFeeManagement}
          onChange={() => {
            updatePool({ isDelegatingSwapFeeManagement: true, swapFeeManager: "" });
          }}
        />
        <RadioInput
          name="swap-fee-manager"
          label="I want my wallet to be the swap fee manager"
          checked={!isDelegatingSwapFeeManagement && swapFeeManager === connectedWalletAddress}
          onChange={() =>
            updatePool({
              isDelegatingSwapFeeManagement: false,
              swapFeeManager: connectedWalletAddress,
            })
          }
        />
        <RadioInput
          name="swap-fee-manager"
          label="Choose a different swap fee manager"
          checked={!isDelegatingSwapFeeManagement && swapFeeManager !== connectedWalletAddress}
          onChange={() => updatePool({ isDelegatingSwapFeeManagement: false, swapFeeManager: "" })}
        />
        {!isDelegatingSwapFeeManagement && swapFeeManager !== connectedWalletAddress && (
          <TextField
            mustBeAddress={true}
            placeholder="Enter swap fee manager address"
            value={swapFeeManager}
            onChange={e => updatePool({ swapFeeManager: e.target.value.trim() })}
          />
        )}
      </div>

      <div className="bg-base-100 p-5 rounded-xl">
        <label className="text-lg font-bold inline-flex">
          <a
            className="flex items-center gap-2 link no-underline hover:underline"
            href="https://docs-v3.balancer.fi/concepts/core-concepts/pool-role-accounts.html"
            target="_blank"
            rel="noreferrer"
          >
            Pause manager
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
          </a>
        </label>
        <RadioInput
          name="pause-manager"
          label="Delegate pause management to the Balancer DAO"
          checked={isDelegatingPauseManagement}
          onChange={() => {
            updatePool({ isDelegatingPauseManagement: true, pauseManager: "" });
          }}
        />
        <RadioInput
          name="pause-manager"
          label="I want my wallet to be the pause manager"
          checked={!isDelegatingPauseManagement && pauseManager === connectedWalletAddress}
          onChange={() =>
            updatePool({
              isDelegatingPauseManagement: false,
              pauseManager: connectedWalletAddress,
            })
          }
        />
        <RadioInput
          name="pause-manager"
          label="Choose a different pause manager"
          checked={!isDelegatingPauseManagement && pauseManager !== connectedWalletAddress}
          onChange={() => updatePool({ isDelegatingPauseManagement: false, pauseManager: "" })}
        />
        {!isDelegatingPauseManagement && pauseManager !== connectedWalletAddress && (
          <div className="flex flex-col gap-3 mt-3">
            <TextField
              mustBeAddress={true}
              placeholder="Enter pause manager address"
              value={pauseManager}
              onChange={e => updatePool({ pauseManager: e.target.value.trim() })}
            />
          </div>
        )}
      </div>

      <div className="bg-base-100 p-5 rounded-xl">
        <label className="text-lg font-bold inline-flex">
          <a
            className="flex items-center gap-2 link no-underline hover:underline"
            href="https://docs-v3.balancer.fi/concepts/core-concepts/hooks.html"
            target="_blank"
            rel="noreferrer"
          >
            Pool hooks
            <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
          </a>
        </label>

        {poolType === PoolType.StableSurge ? (
          <div className="text-lg">The Stable Surge pool type uses a core hooks contract</div>
        ) : (
          <>
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
              <div>
                <div className="mb-4">
                  <TextField
                    isPoolHooksContract={true}
                    mustBeAddress={true}
                    placeholder="Enter pool hooks contract address"
                    value={poolHooksContract}
                    onChange={e => updatePool({ poolHooksContract: e.target.value.trim() })}
                  />
                </div>
                <div className="mt-1 flex flex-col gap-2">
                  {hookFlags?.enableHookAdjustedAmounts ? (
                    <div className="flex items-center gap-1 text-lg">
                      This hook requires unbalanced liquidity operations to be disabled
                      <input type="checkbox" disabled={true} checked={true} className="checkbox ml-2 rounded-md" />
                    </div>
                  ) : (
                    <Checkbox
                      disabled={hookFlags?.enableHookAdjustedAmounts}
                      label="Should this pool disable unbalanced liquidity operations?"
                      checked={disableUnbalancedLiquidity}
                      onChange={() => updatePool({ disableUnbalancedLiquidity: !disableUnbalancedLiquidity })}
                    />
                  )}
                  <Checkbox
                    label="Should this pool accept donations?"
                    checked={enableDonation}
                    onChange={() => updatePool({ enableDonation: !enableDonation })}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

function NumberParameterButton({
  value,
  selectedValue,
  onClick,
  isPercentage = false,
}: {
  isPercentage?: boolean;
  value: string;
  selectedValue: string;
  onClick: () => void;
}) {
  return (
    <div
      className={`bg-base-200 w-20 h-12 rounded-lg flex items-center justify-center hover:cursor-pointer hover:border-2 hover:border-accent text-lg ${
        value === selectedValue ? "border-2 border-accent" : ""
      }`}
      onClick={onClick}
    >
      {value}
      {isPercentage && "%"}
    </div>
  );
}
