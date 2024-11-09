import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TextField } from "~~/components/common";
import { useFetchBoostableMap, usePoolCreationStore } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH } from "~~/utils/constants";

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool } = usePoolCreationStore();

  const { data: boostableWhitelist } = useFetchBoostableMap();

  useEffect(() => {
    if (poolType) {
      const symbol = tokenConfigs
        .map(token => {
          const { useBoostedVariant, tokenInfo, weight } = token;
          const boostedVariant = boostableWhitelist?.[token.address];
          const symbol = useBoostedVariant ? boostedVariant?.symbol : tokenInfo?.symbol;
          if (poolType === PoolType.Weighted && weight) {
            return `${token.weight.toFixed(0)}${symbol}`;
          }
          return symbol;
        })
        .join("-");

      updatePool({
        name: symbol.split("-").join(" "),
        symbol,
      });
    }
  }, [tokenConfigs, poolType, updatePool, boostableWhitelist]);

  return (
    <div>
      <div className="text-xl mb-5">Choose pool information:</div>
      <div className="mb-5 flex flex-col gap-4">
        <div className="bg-base-100 p-5 rounded-xl">
          <TextField
            label="Pool name"
            placeholder="Enter pool name"
            value={name}
            maxLength={MAX_POOL_NAME_LENGTH}
            onChange={e => updatePool({ name: e.target.value })}
          />
        </div>

        <div className="bg-base-100 p-5 rounded-xl">
          <TextField
            label="Pool symbol"
            placeholder="Enter pool symbol"
            value={symbol}
            onChange={e => updatePool({ symbol: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
