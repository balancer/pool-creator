import React from "react";
import { PoolType } from "@balancer/sdk";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";

const POOL_TYPES: AllowedPoolTypes[] = [PoolType.Weighted, PoolType.Stable, PoolType.StableSurge, PoolType.GyroE];

const POOL_TYPE_INFO: Record<AllowedPoolTypes, { label: string; description: string }> = {
  [PoolType.Weighted]: {
    label: "Weighted",
    description:
      "Highly configurable and versatile, Weighted Pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
  },
  [PoolType.Stable]: {
    label: "Stable",
    description:
      "Engineered for assets that trade near parity, Stable Pools are perfect for tightly correlated assets like Stablecoins, ensuring seamless trading with minimal slippage",
  },
  [PoolType.StableSurge]: {
    label: "Stable Surge",
    description:
      "A Balancer core stable pool that uses a stable surge hook deployed by the official stable surge factory",
  },
  [PoolType.GyroE]: {
    label: "Gyro E-CLP",
    description:
      "Gyro's elliptic concentrated liquidity pools concentrate liquidity within price bounds with the flexibility to asymmetrically focus liquidity",
  },
};

export function ChooseType() {
  const { poolType, updatePool, tokenConfigs } = usePoolCreationStore();

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 px-7 py-5">
        <div className="grid grid-cols-2 gap-5 justify-around">
          {POOL_TYPES.map(type => (
            <button
              key={type}
              className={`${
                type === poolType ? `${selectedPoolStyles}` : `bg-base-100 ${hoverPoolStyles} shadow-lg`
              } p-4 w-full rounded-xl `}
              onClick={() => updatePool({ poolType: type, tokenConfigs: tokenConfigs.slice(0, 4) })}
            >
              <div className="flex flex-col text-center">
                <div className="font-bold text-xl w-full">{POOL_TYPE_INFO[type].label}</div>
              </div>
            </button>
          ))}
        </div>

        <div>
          {/* <div className="text-xl mb-2 ml-2">{poolType ? "Description" : "Instructions"}</div> */}
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral h-32 flex flex-col justify-center">
            {poolType ? POOL_TYPE_INFO[poolType].description : INITIAL_INSTRUCTIONS}
          </div>
        </div>
      </div>
    </>
  );
}

const selectedPoolStyles =
  "text-neutral-700 bg-gradient-to-r from-violet-300 via-violet-200 to-orange-300  [box-shadow:0_0_10px_5px_rgba(139,92,246,0.5)]";

const hoverPoolStyles =
  "hover:bg-gradient-to-r hover:from-violet-300 hover:via-violet-200 hover:to-orange-300 hover:text-neutral-700 hover:opacity-80";

const INITIAL_INSTRUCTIONS = (
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
