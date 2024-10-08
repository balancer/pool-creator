import React from "react";
import { initialTokenConfig } from "../page";
import { TokenConfig } from "../types";
import { ChoosePoolToken } from "./ChoosePoolToken";
import { parseUnits } from "viem";
import { PlusIcon } from "@heroicons/react/24/outline";

export function ChoosePoolTokens({
  poolTokens,
  setPoolTokens,
}: {
  poolTokens: TokenConfig[];
  setPoolTokens: (tokens: TokenConfig[]) => void;
}) {
  function handleAddToken() {
    const updatedTokenCount = poolTokens.length + 1;
    const updatedWeight = parseUnits((100 / updatedTokenCount).toString(), 16);
    const updatedPoolTokens = poolTokens.map(token => ({ ...token, weight: updatedWeight }));
    updatedPoolTokens.push({ ...initialTokenConfig, weight: updatedWeight });
    setPoolTokens(updatedPoolTokens);
  }

  return (
    <div>
      <div className="font-bold text-lg mb-3">Choose pool tokens:</div>
      <div className="flex flex-col gap-10">
        {Array.from({ length: poolTokens.length }).map((_, index) => (
          <ChoosePoolToken key={index} index={index} setPoolTokens={setPoolTokens} poolTokens={poolTokens} />
        ))}
        {poolTokens.length < 8 && (
          <div className="flex justify-end">
            <button
              onClick={handleAddToken}
              className="btn bg-base-300 border-none text-primary-content w-[100px] rounded-xl"
            >
              <PlusIcon className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
