import React from "react";
import { ChooseToken } from "./ChooseToken";
import { parseUnits } from "viem";
import { initialTokenConfig, usePoolStore } from "~~/hooks/v3";

export function ChooseTokens() {
  const { tokenConfigs, setTokenConfigs } = usePoolStore();

  function handleAddToken() {
    const updatedTokenCount = tokenConfigs.length + 1;
    const updatedWeight = parseUnits((100 / updatedTokenCount).toString(), 16);
    const updatedPoolTokens = tokenConfigs.map(token => ({ ...token, weight: updatedWeight }));
    updatedPoolTokens.push({ ...initialTokenConfig, weight: updatedWeight });
    setTokenConfigs(updatedPoolTokens);
  }

  return (
    <div>
      <div className="flex flex-col gap-7">
        {Array.from({ length: tokenConfigs.length }).map((_, index) => (
          <ChooseToken key={index} index={index} />
        ))}
        {tokenConfigs.length < 8 && (
          <div className="flex justify-end">
            <button onClick={handleAddToken} className="btn btn-primary border-none mt-5 w-40 rounded-xl text-lg flex">
              Add Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
