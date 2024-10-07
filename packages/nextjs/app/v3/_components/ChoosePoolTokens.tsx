import React, { useState } from "react";
import { TokenConfig } from "../types";
import { ChoosePoolToken } from "./ChoosePoolToken";
import { PlusIcon } from "@heroicons/react/24/outline";

export function ChoosePoolTokens({
  poolTokens,
  setPoolTokens,
}: {
  poolTokens: TokenConfig[];
  setPoolTokens: (tokens: TokenConfig[]) => void;
}) {
  const [tokenCount, setTokenCount] = useState(2);

  function handleAddToken() {
    setTokenCount(prevCount => prevCount + 1);
    setPoolTokens([...poolTokens, {} as TokenConfig]);
  }

  console.log("poolTokens", poolTokens);

  return (
    <div>
      <div className="font-bold text-lg mb-5">Choose Pool Tokens:</div>
      <div className="flex flex-col gap-5">
        {Array.from({ length: tokenCount }).map((_, index) => (
          <ChoosePoolToken key={index} index={index} setPoolTokens={setPoolTokens} poolTokens={poolTokens} />
        ))}
        {tokenCount < 8 && (
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
