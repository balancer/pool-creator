import { ChooseNetwork } from "./ChooseNetwork";
import { PoolConfiguration } from "./PoolConfiguration";
import { PoolDetails } from "./PoolDetails";
import { SupportAndResetModals } from "./SupportAndResetModals";
import { ConnectWalletAlert, MobileNotSupportedAlert, StartedOnDifferentNetworkAlert } from "./UserExperienceAlerts";
import { type Chain } from "viem/chains";
import { useWalletClient } from "wagmi";
import { useUninitializedPool } from "~~/hooks/balancer";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePoolCreationStore } from "~~/hooks/v3";

export function UserFlowManager({ supportedNetworks }: { supportedNetworks: Chain[] }) {
  useUninitializedPool();

  const { chain } = usePoolCreationStore();
  const { targetNetwork: selectedNetwork } = useTargetNetwork();
  const { data: walletClient } = useWalletClient();

  if (!walletClient) return <ConnectWalletAlert />;

  if (!chain) return <ChooseNetwork options={supportedNetworks} />;

  if (chain && selectedNetwork.id !== chain.id) return <StartedOnDifferentNetworkAlert />;

  return (
    <>
      <div className="hidden sm:flex flex-wrap gap-5 w-full justify-center">
        <PoolConfiguration />

        <div className="bg-base-200 w-full max-w-[420px] rounded-xl shadow-lg p-5 h-fit flex flex-col gap-3">
          <div className="flex justify-between items-center gap-2 mr-2">
            <div className="font-bold text-2xl">Pool Preview</div>
            {chain && typeof selectedNetwork.color === "string" && (
              <div className="text-xl font-bold" style={{ color: selectedNetwork.color }}>
                {chain?.name}
              </div>
            )}
          </div>
          <PoolDetails isPreview={true} />
          <SupportAndResetModals />
        </div>
      </div>

      <MobileNotSupportedAlert />
    </>
  );
}
