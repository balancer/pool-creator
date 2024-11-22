import React from "react";
import { PoolType } from "@balancer/sdk";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { usePoolCreationStore } from "~~/hooks/v3";
import { AllowedPoolTypes } from "~~/hooks/v3/usePoolCreationStore";
import { bgBeigeGradient, bgBeigeGradientHover } from "~~/utils";

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
    <>
      <div className="flex flex-col flex-grow justify-center h-full gap-5 px-7">
        <div className="text-xl flex items-center gap-1">
          {/* <div
            className="tooltip tooltip-left tooltip-primary before:text-lg"
            data-tip="Pool types define how trades affect prices, liquidity, and asset balances"
          >
            <InformationCircleIcon className="w-5 h-5" />
          </div> */}
          Choose a
          <a
            href="https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/"
            className="link no-underline flex items-center gap-1.5"
            target="_blank"
            rel="noreferrer"
          >
            pool type
            <InformationCircleIcon className="w-5 h-5 mt-0.5" />
          </a>
        </div>

        <div className="flex flex-grow flex-col justify-around">
          {POOL_TYPES.map(type => (
            <button
              key={type}
              className={`${
                type === poolType ? `${bgBeigeGradient}` : `bg-base-100 hover:text-neutral-700 ${bgBeigeGradientHover}`
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
    </>
  );
}
