"use client";

import { UserFlowManager } from "./_components/UserFlowManager";
import type { NextPage } from "next";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { usePoolStoreDebug, useUserDataStoreDebug } from "~~/hooks/v3";
import { supportedNetworks } from "~~/utils";

const BalancerV3: NextPage = () => {
  usePoolStoreDebug();
  useUserDataStoreDebug();

  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center">
            <BalancerLogo width="55px" />
            <h1 className="text-3xl md:text-5xl font-bold text-center mb-0">Balancer</h1>
          </div>
          <UserFlowManager supportedNetworks={supportedNetworks.balancerV3} />
        </div>
      </div>
    </div>
  );
};

export default BalancerV3;
