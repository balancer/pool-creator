import { PoolType } from "@balancer/sdk";
import { type Address } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { RadioInput, TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function PoolHooks() {
  const { isUsingHooks, poolHooksContract, updatePool, poolType } = usePoolCreationStore();

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
            Stable surge pools must use Balancer&apos;s stable surge hook
            <input type="checkbox" disabled={true} checked={true} className="checkbox ml-2 rounded-md" />
          </div>
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
                poolHooksContract: "" as Address,
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
                  onChange={e => updatePool({ poolHooksContract: e.target.value.trim() as Address })}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
