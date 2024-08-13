import React from "react";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

// import Link from "next/link";
// import { hardhat } from "viem/chains";
// import { CurrencyDollarIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { HeartIcon } from "@heroicons/react/24/outline";
// import { SwitchTheme } from "~~/components/SwitchTheme";
// import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
// import { Faucet } from "~~/components/scaffold-eth";
// import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
// import { useGlobalState } from "~~/services/store/store";

/**
 * Site footer
 */
export const Footer = () => {
  // const nativeCurrencyPrice = useGlobalState(state => state.nativeCurrency.price);
  const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;
  const isSepolia = targetNetwork.id == 11155111;

  return (
    <div className="min-h-0 py-5 px-1 lg:mb-0 bg-base-300 border-t border-base-200">
      {/* <div>
        <div className="fixed flex justify-between items-center w-full z-10 p-4 bottom-0 left-0 pointer-events-none">
          <div className="flex flex-col md:flex-row gap-2 pointer-events-auto">
            {nativeCurrencyPrice > 0 && (
              <div>
                <div className="btn btn-primary btn-sm font-normal gap-1 cursor-auto">
                  <CurrencyDollarIcon className="h-4 w-4" />
                  <span>{nativeCurrencyPrice.toFixed(2)}</span>
                </div>
              </div>
            )}
            {isLocalNetwork && (
              <>
                <Faucet />
                <Link href="/blockexplorer" passHref className="btn btn-primary btn-sm font-normal gap-1">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  <span>Block Explorer</span>
                </Link>
              </>
            )}
          </div>
          <SwitchTheme className={`pointer-events-auto ${isLocalNetwork ? "self-end md:self-auto" : ""}`} />
        </div>
      </div> */}
      <div className="w-full">
        <ul className="menu menu-horizontal w-full text-xl">
          <div className="flex justify-center items-center gap-4 w-full">
            {isSepolia && (
              <>
                <div className="text-center">
                  <a
                    href="https://beta-app-v2-git-sepolia-faucets-balancer.vercel.app/#/sepolia/faucet"
                    target="_blank"
                    rel="noreferrer"
                    className="link no-underline hover:underline"
                  >
                    Faucet
                  </a>
                </div>
                <span>·</span>
              </>
            )}
            <div className="text-center">
              <a
                href="https://github.com/balancer/pool-creator"
                target="_blank"
                rel="noreferrer"
                className="link no-underline hover:underline"
              >
                Github
              </a>
            </div>
            <span>·</span>
            <div className="text-center">
              <a
                href="https://github.com/balancer/cow-amm"
                target="_blank"
                rel="noreferrer"
                className="link no-underline hover:underline"
              >
                Contracts
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
