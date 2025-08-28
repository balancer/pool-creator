import { PoolType } from "@balancer/sdk";
import { type Address, zeroAddress } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { RadioInput, TextField } from "~~/components/common";
import { usePoolCreationStore, usePoolHooksWhitelist } from "~~/hooks/v3";

export function PoolHooks() {
  const { poolHooksContract, updatePool, poolType, chain } = usePoolCreationStore();
  const { poolHooksWhitelist } = usePoolHooksWhitelist(chain?.id);

  const isUsingCustomHook =
    poolHooksContract !== zeroAddress &&
    !poolHooksWhitelist.map(hook => hook.value.toLowerCase()).includes(poolHooksContract.toLowerCase());

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
            name="no-hooks"
            label="I do not want this pool to use any hooks"
            checked={poolHooksContract === zeroAddress}
            onChange={() => {
              updatePool({
                poolHooksContract: zeroAddress,
                disableUnbalancedLiquidity: false,
                enableDonation: false,
              });
            }}
          />
          {poolHooksWhitelist.map(hook => (
            <RadioInput
              key={hook.value}
              name={hook.label}
              label={hook.label}
              checked={poolHooksContract.toLowerCase() === hook.value.toLowerCase()}
              onChange={() => updatePool({ poolHooksContract: hook.value })}
            />
          ))}
          <RadioInput
            name="custom-hooks"
            label="Choose a custom hooks contract"
            checked={isUsingCustomHook}
            onChange={() => updatePool({ poolHooksContract: "" })}
          />
          {isUsingCustomHook && (
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
