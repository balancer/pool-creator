import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "~~/components/common";
import { type HookFlags, usePoolCreationStore } from "~~/hooks/v3";

export function LiquidityManagement() {
  const { poolType, poolHooksContract, enableDonation, disableUnbalancedLiquidity, updatePool } =
    usePoolCreationStore();

  const queryClient = useQueryClient();
  const hookFlags: HookFlags | undefined = queryClient.getQueryData(["validatePoolHooks", poolHooksContract]);

  return (
    <div className="bg-base-100 p-5 rounded-xl">
      <label className="text-lg font-bold inline-flex mb-1">
        <a
          className="flex items-center gap-2 link no-underline hover:underline"
          href="https://github.com/balancer/balancer-v3-monorepo/blob/2d6ae6a3d0082cafcdb9a963421bcd31858a106c/pkg/interfaces/contracts/vault/VaultTypes.sol#L10-L22"
          target="_blank"
          rel="noreferrer"
        >
          Liquidity Management
          <ArrowTopRightOnSquareIcon className="w-5 h-5 mt-0.5" />
        </a>
      </label>
      {poolType === PoolType.StableSurge ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-1 text-lg">
            Stable Surge pools must set disable unbalanced liquidity to false
            <input type="checkbox" disabled={true} checked={false} className="checkbox ml-2 rounded-md" />
          </div>
          <Checkbox
            label="Should this pool accept donations?"
            checked={enableDonation}
            onChange={() => updatePool({ enableDonation: !enableDonation })}
          />
        </div>
      ) : (
        <div>
          <div className="mt-1 flex flex-col gap-2">
            {hookFlags?.enableHookAdjustedAmounts ? (
              <div className="flex items-center gap-1 text-lg">
                This hook requires unbalanced liquidity operations to be disabled
                <input type="checkbox" disabled={true} checked={true} className="checkbox ml-2 rounded-md" />
              </div>
            ) : (
              <Checkbox
                disabled={hookFlags?.enableHookAdjustedAmounts}
                label="Allow unbalanced liquidity operations"
                checked={!disableUnbalancedLiquidity}
                onChange={() => updatePool({ disableUnbalancedLiquidity: !disableUnbalancedLiquidity })}
              />
            )}
            <Checkbox
              label="Allow donations"
              checked={enableDonation}
              onChange={() => updatePool({ enableDonation: !enableDonation })}
            />
          </div>
        </div>
      )}
    </div>
  );
}
