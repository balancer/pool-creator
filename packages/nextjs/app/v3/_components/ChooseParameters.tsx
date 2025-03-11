import React, { useState } from "react";
import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import ReactECharts from "echarts-for-react";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Checkbox, NumberInput, RadioInput, TextField } from "~~/components/common";
import { useEclpPoolChart } from "~~/hooks/gyro";
import { type HookFlags, usePoolCreationStore } from "~~/hooks/v3";

type HandleNumberInputChange = (
  e: React.ChangeEvent<HTMLInputElement>,
  field: "swapFeePercentage" | "amplificationParameter",
  min: number,
  max: number,
) => void;

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

      {poolType === "GyroE" && <EclpParams />}
      <SwapFeePercentage handleNumberInputChange={handleNumberInputChange} />
      {(poolType === PoolType.Stable || poolType === PoolType.StableSurge) && (
        <AmplificationParameter handleNumberInputChange={handleNumberInputChange} />
      )}
      <SwapFeeManger />
      <PauseManager />
      <PoolHooks />
    </div>
  );
};

// TODO: figure out how to keep RotationVectorNormalized for slider and manual?
function EclpParams() {
  const [isUsingSlider, setIsUsingSlider] = useState(true);
  const { eclpParams, updateEclpParam } = usePoolCreationStore();
  const { alpha, beta, s, c, lambda } = eclpParams;

  const { options } = useEclpPoolChart();

  const enforceNumericValue = (value: string, param: keyof typeof eclpParams) => {
    // Allow empty values or numbers with optional decimal point
    if (value === "" || /^[0-9]+\.?[0-9]*$/.test(value)) {
      updateEclpParam({ [param]: value });
    }
  };

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <div className="bg-base-300 p-5 rounded-lg mb-5">
        <a
          className="flex items-center gap-2 link no-underline hover:underline text-lg font-bold mb-3"
          href={"https://docs.gyro.finance/pools/e-clps#reading-e-clp-parameters"}
          target="_blank"
          rel="noreferrer"
        >
          E-CLP Parameters
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
        </a>

        <div className="bg-base-300 w-full h-72 rounded-lg">
          <ReactECharts option={options} style={{ height: "100%", width: "100%" }} />
        </div>
      </div>

      <div className="mb-3 flex gap-2">
        <RadioInput
          name="eclp-params"
          label="Sliders"
          checked={isUsingSlider}
          onChange={() => setIsUsingSlider(true)}
        />
        <RadioInput
          name="eclp-params"
          label="Manual"
          checked={!isUsingSlider}
          onChange={() => setIsUsingSlider(false)}
        />
      </div>

      {isUsingSlider ? (
        <>
          <EclpRange
            label="alpha"
            value={alpha.toString()}
            min={parseUnits("0.8", 18).toString()}
            max={parseUnits("1.2", 18).toString()}
            step={parseUnits("0.01", 18).toString()}
            onChange={e => {
              updateEclpParam({ alpha: BigInt(Number(e.target.value)) });
            }}
          />
          <EclpRange
            label="beta"
            value={beta.toString()}
            min={parseUnits("0.8", 18).toString()}
            max={parseUnits("1.2", 18).toString()}
            step={parseUnits("0.01", 18).toString()}
            onChange={e => updateEclpParam({ beta: BigInt(Number(e.target.value)) })}
          />
          <EclpRange
            label="c"
            value={c.toString()}
            min="0"
            max={parseUnits("1", 18).toString()}
            step={parseUnits("0.01", 18).toString()}
            onChange={e => updateEclpParam({ c: BigInt(Number(e.target.value)) })}
          />
          <EclpRange
            label="s"
            value={s.toString()}
            min="0"
            max={parseUnits("1", 18).toString()}
            step={parseUnits("0.01", 18).toString()}
            onChange={e => updateEclpParam({ s: BigInt(Number(e.target.value)) })}
          />
          <EclpRange
            label="lambda"
            value={lambda.toString()}
            min="0"
            max={parseUnits("1", 26).toString()}
            step={parseUnits("0.1", 26).toString()}
            onChange={e => updateEclpParam({ lambda: BigInt(Number(e.target.value)) })}
          />
        </>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5">
            <TextField
              label="alpha"
              value={alpha.toString()}
              onChange={e => enforceNumericValue(e.target.value, "alpha")}
            />
            <TextField
              label="beta"
              value={beta.toString()}
              onChange={e => enforceNumericValue(e.target.value, "beta")}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <TextField label="c" value={c.toString()} onChange={e => enforceNumericValue(e.target.value, "c")} />
              <TextField label="s" value={s.toString()} onChange={e => enforceNumericValue(e.target.value, "s")} />
            </div>
            <TextField
              label="lambda"
              value={lambda.toString()}
              onChange={e => enforceNumericValue(e.target.value, "lambda")}
            />
          </div>
        </>
      )}
    </div>
  );
}

function EclpRange({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: string;
  step: string;
  min: string;
  max: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="mb-2">
      <div className="flex justify-between">
        <div className="flex ml-2 mb-1 font-bold">{label}</div>
        <div>{value}</div>
      </div>
      <input type="range" step={step} min={min} max={max} value={value} onChange={onChange} className="range" />
    </div>
  );
}

function SwapFeePercentage({ handleNumberInputChange }: { handleNumberInputChange: HandleNumberInputChange }) {
  const swapFeePercentages = ["0.1", "0.3", "1"];

  const { poolType, swapFeePercentage, updatePool } = usePoolCreationStore();

  const MIN_SWAP_FEE_PERCENTAGE = poolType === PoolType.Stable ? 0.0001 : 0.001;

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <a
        className="flex items-center gap-2 link no-underline hover:underline text-lg font-bold mb-3"
        href="https://docs.balancer.fi/developer-reference/contracts/vault-config.html"
        target="_blank"
        rel="noreferrer"
      >
        Swap fee percentage
        <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
      </a>

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
  );
}

function AmplificationParameter({ handleNumberInputChange }: { handleNumberInputChange: HandleNumberInputChange }) {
  const amplificationParameters = ["10", "100", "1000"];

  const { amplificationParameter, updatePool } = usePoolCreationStore();

  return (
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
  );
}

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

function SwapFeeManger() {
  const { swapFeeManager, isDelegatingSwapFeeManagement, updatePool } = usePoolCreationStore();

  const { address: connectedWalletAddress } = useAccount();

  return (
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
  );
}

function PauseManager() {
  const { pauseManager, isDelegatingPauseManagement, updatePool } = usePoolCreationStore();

  const { address: connectedWalletAddress } = useAccount();

  return (
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
  );
}

function PoolHooks() {
  const { isUsingHooks, poolType, poolHooksContract, enableDonation, disableUnbalancedLiquidity, updatePool } =
    usePoolCreationStore();

  const queryClient = useQueryClient();
  const hookFlags: HookFlags | undefined = queryClient.getQueryData(["validatePoolHooks", poolHooksContract]);

  return (
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
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-lg">
            The Stable Surge pool type uses a core hooks contract
            <input type="checkbox" disabled={true} checked={true} className="checkbox ml-2 rounded-md" />
          </div>
          <Checkbox
            label="Should this pool accept donations?"
            checked={enableDonation}
            onChange={() => updatePool({ enableDonation: !enableDonation })}
          />
        </div>
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
  );
}
