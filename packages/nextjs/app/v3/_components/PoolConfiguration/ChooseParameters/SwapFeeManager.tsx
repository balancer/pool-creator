import { type Address, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { RadioInput, TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function SwapFeeManger() {
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
          updatePool({ isDelegatingSwapFeeManagement: true, swapFeeManager: zeroAddress });
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
        label="Choose a custom swap fee manager"
        checked={!isDelegatingSwapFeeManagement && swapFeeManager !== connectedWalletAddress}
        onChange={() => updatePool({ isDelegatingSwapFeeManagement: false, swapFeeManager: "" as Address })}
      />
      {!isDelegatingSwapFeeManagement && swapFeeManager !== connectedWalletAddress && (
        <TextField
          mustBeAddress={true}
          placeholder="Enter swap fee manager address"
          value={swapFeeManager}
          onChange={e => updatePool({ swapFeeManager: e.target.value.trim() as Address })}
        />
      )}
    </div>
  );
}
