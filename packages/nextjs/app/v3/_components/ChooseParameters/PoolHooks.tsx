import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Checkbox, RadioInput, TextField } from "~~/components/common";
import { type HookFlags, usePoolCreationStore } from "~~/hooks/v3";

export function PoolHooks() {
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
