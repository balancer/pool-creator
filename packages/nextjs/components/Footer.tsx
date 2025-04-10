import React from "react";
import { sepolia } from "viem/chains";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

/**
 * Site footer
 */
export const Footer = () => {
  const { targetNetwork } = useTargetNetwork();
  // const isLocalNetwork = targetNetwork.id === hardhat.id;
  const isSepolia = targetNetwork.id == sepolia.id;

  return (
    <div className="min-h-0 py-5 px-1 lg:mb-0 bg-base-300 border-t border-base-200">
      <div className="w-full">
        <ul className="menu menu-horizontal w-full text-xl">
          <div className="flex justify-center items-center gap-4 w-full">
            {isSepolia && (
              <>
                <div className="text-center">
                  <a
                    href="https://sepolia.etherscan.io/address/0x26bfAecAe4D5fa93eE1737ce1Ce7D53F2a0E9b2d#writeContract"
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
                CoW Contracts
              </a>
            </div>
            <span>·</span>
            <div className="text-center">
              <a
                href="https://github.com/balancer/balancer-v3-monorepo"
                target="_blank"
                rel="noreferrer"
                className="link no-underline hover:underline"
              >
                v3 Contracts
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
