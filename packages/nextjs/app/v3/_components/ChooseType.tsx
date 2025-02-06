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
    To begin, please select a pool type. For detailed information about each pool type, check out the{" "}
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
      <div className="flex flex-col justify-center h-full gap-5 px-7">
        <div className="my-10 text-xl">
          <div>{poolType ? POOL_TYPE_DESCRIPTIONS[poolType] : INITIAL_DESCRIPTION}</div>
        </div>

        <div className="flex gap-4 justify-around">
          {POOL_TYPES.map(type => (
            <button
              key={type}
              className={`${
                type === poolType
                  ? `bg-primary text-primary-content`
                  : `bg-base-100 hover:bg-primary hover:text-primary-content hover:opacity-50`
              } p-7 w-full rounded-xl text-lg text shadow-lg`}
              onClick={() => updatePool({ poolType: type, tokenConfigs: tokenConfigs.slice(0, 4) })}
            >
              <div className="flex flex-col text-center">
                <div className="font-bold text-xl w-full">{type}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
