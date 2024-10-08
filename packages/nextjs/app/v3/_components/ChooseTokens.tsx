import React from "react";
import { initialTokenConfig } from "../page";
import { TokenConfig } from "../types";
import { ChooseToken } from "./ChooseToken";
import { parseUnits } from "viem";

export function ChooseTokens({
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
      <div className="flex flex-col gap-5">
        {Array.from({ length: poolTokens.length }).map((_, index) => (
          <ChooseToken key={index} index={index} setPoolTokens={setPoolTokens} poolTokens={poolTokens} />
        ))}
        {poolTokens.length < 8 && (
          <div className="flex justify-end">
            <button onClick={handleAddToken} className="btn btn-primary border-none mt-5 w-48 rounded-xl text-lg flex">
              Add Token
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
