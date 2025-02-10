import React from "react";
import { PoolType } from "@balancer/sdk";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
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

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 px-7 py-5">
        <div className="flex gap-4 justify-around">
          {POOL_TYPES.map(type => (
            <button
              key={type}
              className={`${
                type === poolType ? `bg-accent text-white` : `bg-primary hover:bg-primary hover:opacity-80 shadow-lg`
              } p-7 w-full rounded-xl text-lg text-accent-content`}
              onClick={() => updatePool({ poolType: type, tokenConfigs: tokenConfigs.slice(0, 4) })}
            >
              <div className="flex flex-col text-center">
                <div className="font-bold text-xl w-full">{type}</div>
              </div>
            </button>
          ))}
        </div>

        {poolType ? (
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral">
            <div className="text-xl font-bold mb-2">Description:</div>
            {POOL_TYPE_DESCRIPTIONS[poolType]}
          </div>
        ) : (
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral">
            <div className="text-xl font-bold mb-2">{poolType ? "Description" : "Instructions"}:</div>
            {poolType ? POOL_TYPE_DESCRIPTIONS[poolType] : INITIAL_DESCRIPTION}
          </div>
        )}
      </div>
    </>
  );
}
