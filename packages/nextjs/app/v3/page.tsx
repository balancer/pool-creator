"use client";

import { PoolConfiguration, PoolDetails } from "./_components";
import type { NextPage } from "next";
import { BalancerLogo } from "~~/components/assets/BalancerLogo";
import { usePoolStoreDebug } from "~~/hooks/v3";

const BalancerV3: NextPage = () => {
  usePoolStoreDebug();

  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <div className="flex gap-4 justify-center mb-5">
            <BalancerLogo width="55px" />
            <h1 className="text-5xl font-bold text-center mb-0">Balancer v3</h1>
          </div>
          <div className="flex gap-5 w-full justify-center">
            <PoolConfiguration />
            <div className="bg-base-200 w-full max-w-[400px] rounded-xl shadow-lg p-5">
              <div className="font-bold text-2xl mb-3">Pool Preview</div>
              <PoolDetails isPreview={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalancerV3;
