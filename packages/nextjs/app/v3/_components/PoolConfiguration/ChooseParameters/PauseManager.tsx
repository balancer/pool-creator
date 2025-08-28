import { type Address, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { RadioInput, TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function PauseManager() {
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
          updatePool({ isDelegatingPauseManagement: true, pauseManager: zeroAddress });
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
        label="Choose a custom pause manager"
        checked={!isDelegatingPauseManagement && pauseManager !== connectedWalletAddress}
        onChange={() => updatePool({ isDelegatingPauseManagement: false, pauseManager: "" as Address })}
      />
      {!isDelegatingPauseManagement && pauseManager !== connectedWalletAddress && (
        <div className="flex flex-col gap-3 mt-3">
          <TextField
            mustBeAddress={true}
            placeholder="Enter pause manager address"
            value={pauseManager}
            onChange={e => updatePool({ pauseManager: e.target.value.trim() as Address })}
          />
        </div>
      )}
    </div>
  );
}
