import React from "react";
import { PoolType } from "@balancer/sdk";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";
import { bgBeigeGradient } from "~~/utils";

const POOL_TYPES: AllowedPoolTypes[] = [PoolType.Weighted, PoolType.Stable];

const POOL_TYPE_DESCRIPTIONS: Record<AllowedPoolTypes, string> = {
  [PoolType.Weighted]:
    "Highly configurable and versatile, Weighted Pools support up to 8 tokens with customizable weightings, allowing for fine-tuned exposure to multiple assets",
  [PoolType.Stable]:
    "Engineered for assets that trade near parity, Stable Pools are perfect for tightly correlated assets like Stablecoins, ensuring seamless trading with minimal slippage",
};

export function ChooseType() {
  const { poolType, setPoolType } = usePoolCreationStore();

  return (
    <div className="flex flex-col flex-grow justify-center h-full gap-5">
      {POOL_TYPES.map(type => (
        <button
          key={type}
          className={`${
            type === poolType ? `${bgBeigeGradient} text-neutral-700` : `bg-base-100`
          } hover:scale-105 p-7 w-full rounded-xl  text-lg text shadow-lg`}
          onClick={() => setPoolType(type)}
        >
          <div className="flex flex-col items-start">
            <div className="font-bold text-xl text-center w-full mb-2">{type}</div>
            <div className="text-start">{POOL_TYPE_DESCRIPTIONS[type]}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
