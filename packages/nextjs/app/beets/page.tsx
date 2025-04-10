"use client";

import {
  ChooseNetwork,
  ConnectWalletAlert,
  PoolConfiguration,
  PoolDetails,
  StartedOnDifferentNetworkAlert,
  UserExperienceAlerts,
} from "../v3/_components";
import type { NextPage } from "next";
import { useWalletClient } from "wagmi";
import { BeetsLogo } from "~~/components/assets/BeetsLogo";
import { Alert, ContactSupportModal, PoolStateResetModal } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { usePoolCreationStore, usePoolStoreDebug, useUserDataStore } from "~~/hooks/v3";
import { availableNetworks } from "~~/utils";

const BalancerV3: NextPage = () => {
  const { clearPoolStore, chain } = usePoolCreationStore();
  const { targetNetwork: selectedNetwork } = useTargetNetwork();
  const { data: walletClient } = useWalletClient();
  const { clearUserData } = useUserDataStore();
  usePoolStoreDebug();

  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center">
            <BeetsLogo width="40px" />
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-0">Beets</h1>
          </div>

          {!walletClient ? (
            <ConnectWalletAlert />
          ) : !chain ? (
            <div className="hidden sm:flex flex-wrap gap-5 w-full justify-center">
              <ChooseNetwork options={availableNetworks.beets} />
            </div>
          ) : chain && selectedNetwork.id !== chain.id ? (
            <StartedOnDifferentNetworkAlert />
          ) : (
            <>
              <UserExperienceAlerts />

              <div className="hidden sm:flex flex-wrap gap-5 w-full justify-center">
                <PoolConfiguration />

                <div className="bg-base-200 w-full max-w-[400px] rounded-xl shadow-lg p-5 h-fit">
                  <div className="flex justify-between items-center gap-2 mb-3 mr-2">
                    <div className="font-bold text-2xl">Pool Preview</div>

                    <div
                      className="text-xl font-bold"
                      style={{
                        color: chain && typeof selectedNetwork.color === "string" ? selectedNetwork.color : "grey",
                      }}
                    >
                      {chain?.name}
                    </div>
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
                      trigger={<span className="hover:underline">Reset Progress</span>}
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
