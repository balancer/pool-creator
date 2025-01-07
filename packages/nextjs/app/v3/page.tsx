"use client";

import { useState } from "react";
import Link from "next/link";
import { PoolConfiguration, PoolDetails } from "./_components";
import type { NextPage } from "next";
import { ArrowUpRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { Alert, ContactSupportModal, PoolStateResetModal, SafeWalletAlert } from "~~/components/common";
import { useIsSafeWallet } from "~~/hooks/safe";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePoolCreationStore, useUserDataStore, useValidateNetwork } from "~~/hooks/v3";

const BalancerV3: NextPage = () => {
  const { isWrongNetwork, isWalletConnected } = useValidateNetwork();
  const { clearPoolStore, chain } = usePoolCreationStore();
  const { clearUserData } = useUserDataStore();
  const { targetNetwork: selectedNetwork } = useTargetNetwork();
  const [isInfoAlertVisible, setIsInfoAlertVisible] = useState(true);

  const isSafeWallet = useIsSafeWallet();

  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center">
            <BalancerLogo width="55px" />
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-0">Balancer v3</h1>
          </div>

          {!isWalletConnected ? (
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
          ) : isSafeWallet ? (
            <div>
              <SafeWalletAlert />
            </div>
          ) : isWrongNetwork ? (
            <div className="flex justify-center w-full">
              <div>
                <Alert type="warning">
                  <div className="flex items-center gap-2">
                    You are connected to an unsupported network. To continue, please switch to Sepolia, Ethereum, or
                    Gnosis
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </Alert>
              </div>
            </div>
          ) : chain && selectedNetwork.id !== chain.id ? (
            <div className="flex justify-center w-full">
              <div>
                <Alert type="warning">
                  <div className="flex items-center gap-2">
                    You have already begun the pool configuration process. Please switch back to {chain.name}
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </Alert>
              </div>
            </div>
          ) : (
            <>
              {!chain && (
                <div className="flex justify-center">
                  <div className="w-[1130px]">
                    <Alert type="warning">
                      <div className="flex items-center gap-2">
                        Make sure you switch to your desired network before beginning pool creation. You cannot switch
                        after selecting pool type unless you reset progress
                        <ArrowUpRightIcon className="w-4 h-4" />
                      </div>
                    </Alert>
                  </div>
                </div>
              )}
              {isInfoAlertVisible && (
                <div className="flex justify-center">
                  <div className="w-[1130px] relative">
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
                      className="absolute top-3 right-3 p-1  rounded-full transition-colors text-neutral-700"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              <div className="hidden sm:flex flex-wrap gap-5 w-full justify-center">
                <PoolConfiguration />

                <div className="bg-base-200 w-full max-w-[420px] rounded-xl shadow-lg p-5 h-fit">
                  <div className="flex justify-between items-center gap-2 mb-3 mr-2">
                    <div className="font-bold text-2xl">Pool Preview</div>
                    {chain && (
                      <div
                        className="text-xl font-bold"
                        style={{ color: typeof chain.color === "string" ? chain.color : "rgb(135, 255, 101)" }}
                      >
                        {chain?.name}
                      </div>
                    )}
                  </div>
                  <PoolDetails isPreview={true} />
                  <div className="flex justify-center mt-4 gap-2 items-center">
                    <ContactSupportModal />
                    <div className="text-xl">·</div>
                    <PoolStateResetModal
                      clearState={() => {
                        clearPoolStore();
                        clearUserData();
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="sm:hidden">
                <Alert type="warning">
                  <div className="flex items-center gap-2">Pool creation not available on mobile</div>
                </Alert>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BalancerV3;
