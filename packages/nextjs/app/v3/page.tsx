"use client";

import { useState } from "react";
import { PoolConfiguration, PoolDetails } from "./_components";
import type { NextPage } from "next";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { Alert, PoolStateResetModal } from "~~/components/common";
import { usePoolCreationStore, usePoolStoreDebug, useUserDataStoreDebug, useValidateNetwork } from "~~/hooks/v3";

const BalancerV3: NextPage = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  usePoolStoreDebug();
  useUserDataStoreDebug();
  const { isWrongNetwork, isWalletConnected } = useValidateNetwork();
  const { updatePool, clearPoolStore } = usePoolCreationStore();

  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center mb-5">
            <BalancerLogo width="55px" />
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-0">Balancer v3</h1>
          </div>

          {!isWalletConnected ? (
            <div className="flex justify-center w-full">
              <div>
                <Alert type="warning">
                  <div className="flex items-center gap-2">
                    Please connect a wallet and switch to the Sepolia mainnet network
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </Alert>
              </div>
            </div>
          ) : isWrongNetwork ? (
            <div className="flex justify-center w-full">
              <div>
                <Alert type="warning">
                  <div className="flex items-center gap-2">
                    You are connected to an unsupported network. To continue, please switch to Sepolia
                    <ArrowUpRightIcon className="w-4 h-4" />
                  </div>
                </Alert>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden sm:flex flex-wrap gap-5 w-full justify-center">
                <PoolConfiguration />

                <div className="bg-base-200 w-full max-w-[420px] rounded-xl shadow-lg p-5 h-fit">
                  <div className="font-bold text-2xl mb-3">Pool Preview</div>
                  <PoolDetails isPreview={true} />
                  <div className="flex justify-center mt-3">
                    <div
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-center underline cursor-pointer text-lg mt-2"
                    >
                      Want help?
                    </div>
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
      {isResetModalOpen && (
        <PoolStateResetModal
          setIsModalOpen={setIsResetModalOpen}
          clearState={() => {
            clearPoolStore();
            updatePool({ selectedTab: "Type" });
          }}
        />
      )}
    </div>
  );
};

export default BalancerV3;
