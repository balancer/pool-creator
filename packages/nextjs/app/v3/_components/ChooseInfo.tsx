import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TextField } from "~~/components/common";
import { usePoolCreationStore } from "~~/hooks/v3";
import { TokenConfig } from "~~/hooks/v3/usePoolCreationStore";

function buildPoolName(poolType: PoolType, tokenConfigs: TokenConfig[]): string {
  const tokenParts = tokenConfigs
    .map(token =>
      poolType === PoolType.Weighted && token.weight
        ? `${token.weight}${token.tokenInfo?.symbol}`
        : token.tokenInfo?.symbol,
    )
    .join(" ");
  return `Balancer ${poolType} ${tokenParts}`;
}

function buildPoolSymbol(poolType: PoolType, tokenConfigs: TokenConfig[]): string {
  return tokenConfigs
    .map(token =>
      poolType === PoolType.Weighted && token.weight
        ? `${token.weight}${token.tokenInfo?.symbol}`
        : token.tokenInfo?.symbol,
    )
    .join("-");
}

export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool } = usePoolCreationStore();

  useEffect(() => {
    if (poolType) {
      updatePool({
        name: buildPoolName(poolType, tokenConfigs),
        symbol: buildPoolSymbol(poolType, tokenConfigs),
      });
    }
  }, [tokenConfigs, poolType, updatePool]);

  return (
    <div>
      <div className="text-xl mb-5">Choose pool information:</div>
      <div className="mb-5 flex flex-col gap-4 px-5">
        <TextField
          label="Pool name"
          placeholder="Enter pool name"
          value={name}
          onChange={e => updatePool({ name: e.target.value })}
        />

        <TextField
          label="Pool symbol"
          placeholder="Enter pool symbol"
          value={symbol}
          onChange={e => updatePool({ symbol: e.target.value })}
        />
      </div>
    </div>
  );
};
