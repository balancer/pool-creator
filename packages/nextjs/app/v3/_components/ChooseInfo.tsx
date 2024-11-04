import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TextField } from "~~/components/common";
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";

export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool } = usePoolCreationStore();
  const { standardToBoosted } = useFetchBoostableTokens();

  useEffect(() => {
    if (poolType) {
      const symbol = tokenConfigs
        .map(token => {
          const { useBoostedVariant, tokenInfo, weight } = token;
          const boostedVariant = standardToBoosted[token.address];
          const symbol = useBoostedVariant ? boostedVariant.symbol : tokenInfo?.symbol;
          if (poolType === PoolType.Weighted && weight) {
            return `${token.weight.toFixed(1)}${symbol}`;
          }
          return symbol;
        })
        .join("-");

      updatePool({
        name: `Balancer ${symbol.split("-").join(" ")}`,
        symbol,
      });
    }
  }, [tokenConfigs, poolType, updatePool, standardToBoosted]);

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
