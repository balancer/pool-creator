"use client";

import { useEffect, useState } from "react";
import { ConnectWalletAlert } from "../v3/_components";
import { PoolConfiguration, PoolCreation } from "./_components";
import { ChooseNetwork } from "./_components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { CowAMM } from "~~/components/assets/CowAMM";
import { usePoolCreationStore } from "~~/hooks/cow";
import { availableNetworks } from "~~/utils";

const CowAmm: NextPage = () => {
  const [isMounted, setIsMounted] = useState(false);
  const { poolCreation, updatePoolCreation, clearPoolCreation } = usePoolCreationStore();
  const { chainId, isConnected } = useAccount();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const supportedChainIds = availableNetworks.cowAmm.map(network => network.id);

  const isConnectedToSupportedChain = chainId
    ? supportedChainIds.includes(chainId as (typeof supportedChainIds)[number])
    : false;

  return (
    <div className="flex-grow bg-base-300">
      <div className="flex justify-center px-5">
        <div className="w-full">
          <div className="flex items-center flex-col flex-grow py-14 gap-6">
            <CowAMM width="333" />

            {!isConnected ? (
              <ConnectWalletAlert />
            ) : !isConnectedToSupportedChain ? (
              <ChooseNetwork options={availableNetworks.cowAmm} />
            ) : !isMounted ? (
              <CowLoadingSkeleton />
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
      <div className="w-[555px] h-[562px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
      <div className="w-[555px] h-[75px]">
        <div className="animate-pulse bg-base-200 rounded-xl w-full h-full"></div>
      </div>
    </>
  );
};
