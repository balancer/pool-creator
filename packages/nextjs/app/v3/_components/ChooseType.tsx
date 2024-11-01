import React from "react";
import { PoolType } from "@balancer/sdk";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";

const POOL_TYPES: AllowedPoolTypes[] = [PoolType.Weighted, PoolType.Stable];

const POOL_TYPE_DESCRIPTIONS: Record<AllowedPoolTypes, string> = {
  [PoolType.Weighted]:
    "Highly configurable and versatile, Weighted Pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
  [PoolType.Stable]:
    "Engineered for assets that trade near parity, Stable Pools are perfect for tightly correlated assets like Stablecoins, ensuring seamless trading with minimal slippage",
};

export function ChooseType() {
  const { poolType, updatePool } = usePoolCreationStore();

  return (
    <div>
      <div className="flex flex-col flex-grow justify-center h-full gap-5 px-7">
        <div className="text-xl">Choose a Pool Type:</div>

        {POOL_TYPES.map(type => (
          <button
            key={type}
            className={`${
              type === poolType
                ? `bg-[#757e89] text-accent-content`
                : `bg-base-100 hover:bg-[#7e8793] hover:text-accent-content`
            } p-7 w-full rounded-xl text-lg text shadow-lg`}
            onClick={() => updatePool({ poolType: type })}
          >
            <div className="flex flex-col text-center">
              <div className="font-bold text-xl mb-2 w-full">{type}</div>
              <div>{POOL_TYPE_DESCRIPTIONS[type]}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
