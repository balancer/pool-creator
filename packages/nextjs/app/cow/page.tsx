"use client";

import { useEffect, useState } from "react";
import { PoolConfiguration, PoolCreation } from "./_components";
import type { NextPage } from "next";
import { CowAMM } from "~~/components/assets/CowAMM";
import { Alert } from "~~/components/common/Alert";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe";

const CowAmm: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);

  const { poolCreation, updatePoolCreation, clearPoolCreation } = usePoolCreationStore();

  const isSafeWallet = useIsSafeWallet();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="flex-grow bg-base-300">
      <div className="flex justify-center px-5">
        <div className="w-full md:w-[555px]">
          <div className="flex items-center flex-col flex-grow py-14 gap-6">
            <CowAMM width="333" />
            {!isMounted ? (
              <CowLoadingSkeleton />
            ) : isSafeWallet ? (
              <Alert type="warning">
                Safe wallets are not yet supported for CoW AMM pool creation. Please create the pool with an externally
                owned account, and then add liquidity on balancer.fi with your Safe wallet.
              </Alert>
            ) : !poolCreation ? (
              <PoolConfiguration />
            ) : (
              <PoolCreation
                poolCreation={poolCreation}
                updatePoolCreation={updatePoolCreation}
                clearPoolCreation={clearPoolCreation}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CowAmm;

const CowLoadingSkeleton = () => {
  return (
    <>
      <div className="w-full h-[562px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
      <div className="w-full h-[75px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
    </>
  );
};
