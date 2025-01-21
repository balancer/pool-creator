import { useState } from "react";
import Link from "next/link";
import { useWalletClient } from "wagmi";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Alert } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";

export function UserExperienceAlerts() {
  const [isInfoAlertVisible, setIsInfoAlertVisible] = useState(true);
  const { chain } = usePoolCreationStore();

  const { data: walletClient } = useWalletClient();

  const isWalletConnected = !!walletClient;

  return !isWalletConnected ? (
    <div className="flex justify-center w-full">
      <div>
        <Alert type="warning">
          <div className="flex items-center gap-2">
            Please connect a wallet and switch to the network you wish to create a pool
            <ArrowUpRightIcon className="w-4 h-4" />
          </div>
        </Alert>
      </div>
    </div>
  ) : (
    <>
      {!chain && (
        <div className="flex justify-center">
          <div className="w-[1110px]">
            <Alert type="warning">
              <div className="flex items-center gap-2">
                Make sure you switch to your desired network before beginning pool creation. You cannot switch after
                selecting pool type unless you reset progress
                <ArrowUpRightIcon className="w-4 h-4" />
              </div>
            </Alert>
          </div>
        </div>
      )}
      {isInfoAlertVisible && (
        <div className="flex justify-center">
          <div className="w-[1110px] relative">
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

export function StartedOnDifferentNetworkAlert() {
  const { chain } = usePoolCreationStore();

  return (
    <div className="flex justify-center w-full">
      <div className="w-[1110px]">
        <Alert type="warning">
          <div className="flex items-center gap-2">
            You have already begun the pool configuration process on {chain?.name}. If you wish to start creating a pool
            on a different network, choose reset progress after switching back to {chain?.name}.
            <ArrowUpRightIcon className="w-4 h-4" />
          </div>
        </Alert>
      </div>
    </div>
  );
}
