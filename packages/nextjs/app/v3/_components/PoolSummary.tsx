"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { usePoolStore } from "~~/hooks/v3";

export function PoolSummary() {
  const { type, tokens } = usePoolStore();
  const isPoolTypeChosen = !type;
  const isPoolTokensChosen = tokens.every(token => token.address === undefined);
  return (
    <div className="bg-base-200 w-full max-w-[400px] rounded-xl p-7 shadow-lg">
      <div className="font-bold text-2xl mb-7">Pool Summary</div>

      <div className="text-lg">
        <div className="flex justify-between mb-3">
          <div className="font-bold">Type: </div>
          <div className={`h-7 w-7 rounded-full ${type === "Weighted" ? "" : ""}`}>
            {isPoolTypeChosen ? (
              <QuestionMarkCircleIcon className="w-7 h-7" />
            ) : (
              <CheckCircleIcon className="w-7 h-7" />
            )}
          </div>
        </div>
        <div>{isPoolTypeChosen ? <i>No type selected</i> : `${type} Pool`}</div>
      </div>
      <hr className="border-base-content opacity-30 my-5" />
      <div className="text-lg">
        <div className="flex justify-between mb-3">
          <div className="font-bold">Tokens: </div>
          <div className={`h-7 w-7 rounded-full ${type === "Weighted" ? "" : ""}`}>
            {isPoolTokensChosen ? (
              <QuestionMarkCircleIcon className="w-7 h-7" />
            ) : (
              <CheckCircleIcon className="w-7 h-7" />
            )}
          </div>
        </div>
        <div>
          {isPoolTokensChosen ? (
            <i>No tokens selected</i>
          ) : (
            <div className="flex flex-col gap-2">
              {tokens.map((token, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-base-300 w-7 h-7 rounded-full"></div>
                  <div className="font-bold">{token.symbol}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <hr className="border-base-content opacity-30 my-5" />
    </div>
  );
}
