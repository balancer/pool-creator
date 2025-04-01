import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { avalanche } from "viem/chains";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";

export function ChooseType() {
  const { poolType, updatePool, tokenConfigs } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();

  const POOL_TYPES: Record<AllowedPoolTypes, { label: string; description: string }> = {
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
    [PoolType.GyroE]: {
      label: "Gyro E-CLP",
      description:
        "Gyro's elliptic concentrated liquidity pools concentrate liquidity within price bounds with the flexibility to asymmetrically focus liquidity",
    },
  } as Record<AllowedPoolTypes, { label: string; description: string }>;

  // Stable surge not available on avalanche for now
  if (targetNetwork.id !== avalanche.id) {
    POOL_TYPES[PoolType.StableSurge] = {
      label: "Stable Surge",
      description:
        "A Balancer core stable pool that uses a stable surge hook deployed by the official stable surge factory",
    };
  }
  useEffect(() => {
    if (targetNetwork.id === avalanche.id && poolType === PoolType.StableSurge) updatePool({ poolType: undefined });
  }, [targetNetwork.id, poolType, updatePool]);

  const availablePoolTypes = Object.keys(POOL_TYPES);

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10 px-7 py-5">
        <div
          className={`grid ${availablePoolTypes.length % 3 === 0 ? "grid-cols-3" : "grid-cols-2"} gap-5 justify-around`}
        >
          {availablePoolTypes.map(type => (
            <button
              key={type}
              className={`${
                type === poolType ? `${selectedPoolStyles}` : `bg-base-100 ${hoverPoolStyles} shadow-lg`
              } p-4 w-full rounded-xl `}
              onClick={() => updatePool({ poolType: type as AllowedPoolTypes, tokenConfigs: tokenConfigs.slice(0, 4) })}
            >
              <div className="flex flex-col text-center">
                <div className="font-bold text-xl w-full">{POOL_TYPES[type as AllowedPoolTypes].label}</div>
              </div>
            </button>
          ))}
        </div>

        <div>
          <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral h-32 flex flex-col justify-center">
            {poolType ? POOL_TYPES[poolType]?.description : INITIAL_INSTRUCTIONS}
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
    Begin by selecting the type of pool you wish to create. For more information about pool types, check out our{" "}
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
