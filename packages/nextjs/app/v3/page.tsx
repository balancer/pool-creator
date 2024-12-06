"use client";

import { useState } from "react";
import { PoolConfiguration, PoolDetails } from "./_components";
import type { NextPage } from "next";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { Alert, PoolStateResetModal } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePoolCreationStore, usePoolStoreDebug, useUserDataStoreDebug, useValidateNetwork } from "~~/hooks/v3";

const BalancerV3: NextPage = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  const { isWrongNetwork, isWalletConnected } = useValidateNetwork();
  const { updatePool, clearPoolStore, chain } = usePoolCreationStore();
  const { targetNetwork: selectedNetwork } = useTargetNetwork();

  usePoolStoreDebug();
  useUserDataStoreDebug();

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
                    You are connected to an unsupported network. To continue, please switch
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
                    You have already begun the pool configuration process. Please switch back to {chain.name} to
                    continue or if you prefer to switch networks,
                    <div className="link" onClick={() => setIsResetModalOpen(true)}>
                      start over
                    </div>
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
                        after selecting pool type unless you start over
                        <ArrowUpRightIcon className="w-4 h-4" />
                      </div>
                    </Alert>
                  </div>
                </div>
              )}
              <div className="flex justify-center">
                <div className="w-[1130px]">
                  <Alert type="info">
                    <div className="flex items-center gap-2">
                      Before starting the pool configuration process, we recommend that you review our pool creation
                      documentation
                    </div>
                  </Alert>
                </div>
              </div>

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
                  <div className="flex justify-center mt-3">
                    <div
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-center underline cursor-pointer text-lg mt-2"
                    >
                      Contact Support / Start Over
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
