import { useState } from "react";
import Link from "next/link";
import { SupportAndResetModals } from "./SupportAndResetModals";
import { useSwitchChain } from "wagmi";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { Alert } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function UserExperienceAlerts() {
  const [isInfoAlertVisible, setIsInfoAlertVisible] = useState(true);

  return (
    <>
      {isInfoAlertVisible && (
        <div className="flex justify-center">
          <div className="w-[1140px] relative">
            <Alert type="info">
              <div className="flex items-center gap-2">
                For tips and guidance on pool configuration and creation, check out our
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://docs-v3.balancer.fi/partner-onboarding/balancer-v3/pool-creation.html"
                  className="link underline"
                >
                  partner onboarding documentation
                </Link>
              </div>
            </Alert>
            <button
              onClick={() => setIsInfoAlertVisible(false)}
              className="absolute top-3 right-3 p-1 rounded-full transition-colors text-neutral-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ConnectWalletAlert() {
  return (
    <div className="flex justify-center w-full">
      <div>
        <Alert type="warning">
          <div className="flex items-center gap-2">
            Please connect a wallet to begin the pool creation process
            <ArrowUpRightIcon className="w-4 h-4" />
          </div>
        </Alert>
      </div>
    </div>
  );
}

export function StartedOnDifferentNetworkAlert() {
  const { chain } = usePoolCreationStore();
  const { switchChain } = useSwitchChain();

  return (
    <div>
      <div className="flex justify-center w-full">
        <div className="w-[1110px] flex flex-col gap-3">
          <Alert type="warning">
            <div className="flex items-center gap-2">
              You have already begun the pool configuration process on {chain?.name}
            </div>
          </Alert>
          <Alert type="info">
            <div className="flex items-center gap-2">
              To continue progress, switch back to{" "}
              {chain && (
                <span onClick={() => switchChain?.({ chainId: chain?.id })} className="link">
                  {chain?.name}
                </span>
              )}
            </div>
          </Alert>
          <Alert type="info">
            <div className="flex items-center gap-2">
              To start over on a new network, you must first
              <SupportAndResetModals hideSupport={true} />
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}

export function MobileNotSupportedAlert() {
  return (
    <div className="sm:hidden">
      <Alert type="warning">
        <div className="flex items-center gap-2">Pool creation not available on mobile</div>
      </Alert>
    </div>
  );
}
