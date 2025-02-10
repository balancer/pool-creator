import { useState } from "react";
import Link from "next/link";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Alert } from "~~/components/common";
import { PoolStateResetModal } from "~~/components/common";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function UserExperienceAlerts() {
  const [isInfoAlertVisible, setIsInfoAlertVisible] = useState(true);
  const { chain } = usePoolCreationStore();

  return (
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

export function ConnectWalletAlert() {
  return (
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
  );
}

export function StartedOnDifferentNetworkAlert() {
  const { chain, clearPoolStore } = usePoolCreationStore();
  const { clearUserData } = useUserDataStore();

  return (
    <div>
      <div className="flex justify-center w-full">
        <div className="w-[1110px] flex flex-col gap-3">
          <Alert type="warning">
            <div className="flex items-center gap-2">
              You have already begun the pool configuration process on {chain?.name}. To start over on a new network,
              reset progress
            </div>
          </Alert>
          <Alert type="info">
            <div className="flex items-center gap-2">
              To continue progress, switch back to the {chain?.name} network
            </div>
          </Alert>
          <Alert type="error">
            <div className="flex items-center gap-2">
              To start over on a new network, reset progress by clicking
              <PoolStateResetModal
                trigger={<span className="underline">here</span>}
                clearState={() => {
                  clearPoolStore();
                  clearUserData();
                }}
              />
            </div>
          </Alert>
        </div>
      </div>
    </div>
  );
}
