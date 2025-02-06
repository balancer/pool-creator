import React from "react";
import { PoolType } from "@balancer/sdk";
import { sepolia } from "viem/chains";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";

const POOL_TYPES: AllowedPoolTypes[] = [PoolType.Weighted, PoolType.Stable, PoolType.StableSurge];

const POOL_TYPE_DESCRIPTIONS: Record<AllowedPoolTypes, string> = {
  [PoolType.Weighted]:
    "Highly configurable and versatile, Weighted Pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
  [PoolType.Stable]:
    "Engineered for assets that trade near parity, Stable Pools are perfect for tightly correlated assets like Stablecoins, ensuring seamless trading with minimal slippage",
  [PoolType.StableSurge]:
    "A core stable pool that uses a stable surge hook deployed by the official stable surge factory",
};

const INITIAL_DESCRIPTION = (
  <div>
    Begin by selecting a pool type. For detailed information about each pool type, check out our{" "}
    <a
      href="https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/"
      className="link inline-flex items-center gap-1"
      target="_blank"
      rel="noreferrer"
    >
      docs
      <ArrowUpRightIcon className="w-3.5 h-3.5" />
    </a>
  </div>
);

export function ChooseType() {
  const { poolType, updatePool, tokenConfigs } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();

  const isSepolia = targetNetwork.id === sepolia.id;

  // Filter pool types based on network
  const availablePoolTypes = POOL_TYPES.filter(type => {
    if (type === PoolType.StableSurge) return isSepolia;
    return true;
  });

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 px-7 py-5">
        {!poolType && (
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral">
            <div className="text-xl font-bold mb-2">{poolType ? "Description" : "Instructions"}:</div>
            {poolType ? POOL_TYPE_DESCRIPTIONS[poolType] : INITIAL_DESCRIPTION}
          </div>
        )}

        <div className="flex gap-4 justify-around">
          {availablePoolTypes.map(type => (
            <button
              key={type}
              className={`${
                type === poolType
                  ? `bg-primary text-primary-content`
                  : `bg-base-100 hover:bg-primary hover:text-primary-content hover:opacity-50 shadow-lg`
              } p-7 w-full rounded-xl text-lg text`}
              onClick={() => updatePool({ poolType: type, tokenConfigs: tokenConfigs.slice(0, 4) })}
            >
              <div className="flex flex-col text-center">
                <div className="font-bold text-xl w-full">{type}</div>
              </div>
            </button>
          ))}
        </div>

        {poolType && (
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral">
            <div className="text-xl font-bold mb-2">Description:</div>
            {POOL_TYPE_DESCRIPTIONS[poolType]}
          </div>
        )}
      </div>
    </>
  );
}
