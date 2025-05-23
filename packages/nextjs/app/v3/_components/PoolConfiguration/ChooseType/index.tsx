import React from "react";
import { PoolTypeButton } from "./PoolTypeButton";
// import { ArrowUpRightIcon } from "@heroicons/react/24/solid";
// import { usePoolCreationStore } from "~~/hooks/v3";
import { type SupportedPoolTypes, poolTypeMap } from "~~/utils/constants";

export function ChooseType() {
  // const { poolType } = usePoolCreationStore();

  const poolTypes = Object.keys(poolTypeMap).slice(0, 4) as SupportedPoolTypes[];

  return (
    <>
      <div className="flex flex-col justify-center h-full gap-10">
        <div className="flex flex-col gap-5">
          <div className="text-xl">Choose a pool type:</div>
          <div className="flex flex-col gap-4 px-24">
            {poolTypes.map((type: SupportedPoolTypes) => (
              <PoolTypeButton key={type} selectedPoolType={type} />
            ))}
          </div>
        </div>

        {/* <div className="text-xl bg-base-100 rounded-xl p-5 border border-neutral h-32 flex flex-col justify-center">
          {poolType ? poolTypeMap[poolType].description : staringInstructions}
        </div> */}
      </div>
    </>
  );
}

// const staringInstructions = (
//   <div>
//     Begin by selecting the type of pool you wish to create. For more information about pool types, check out our{" "}
//     <a
//       href="https://docs-v3.balancer.fi/concepts/explore-available-balancer-pools/"
//       className="link inline-flex items-center gap-1"
//       target="_blank"
//       rel="noreferrer"
//     >
//       docs
//       <ArrowUpRightIcon className="w-3.5 h-3.5" />
//     </a>
//   </div>
// );
