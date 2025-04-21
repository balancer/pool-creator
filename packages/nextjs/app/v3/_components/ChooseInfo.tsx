import React, { useEffect } from "react";
import { ChooseTokenAmounts } from "./ChooseTokenAmounts";
import { PoolType } from "@balancer/sdk";
import { TextField } from "~~/components/common";
import { useBoostableWhitelist, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { BEETS_MAX_POOL_NAME_LENGTH, MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from "~~/utils/constants";
import { sonic } from "~~/utils/customChains";

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool, chain } = usePoolCreationStore();
  const { updateUserData, hasEditedPoolName, hasEditedPoolSymbol } = useUserDataStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();
  useEffect(() => {
    if (poolType) {
      const symbol = tokenConfigs
        .map(token => {
          const { useBoostedVariant, tokenInfo, weight } = token;
          const boostedVariant = boostableWhitelist?.[token.address];
          const symbol = useBoostedVariant ? boostedVariant?.symbol : tokenInfo?.symbol;
          if (poolType === PoolType.Weighted && weight) {
            return `${weight.toFixed(0)}${symbol}`;
          }
          return symbol;
        })
        .join("-");

      if (!hasEditedPoolName) updatePool({ name: symbol.split("-").join(" ") });
      if (!hasEditedPoolSymbol) updatePool({ symbol });
    }
  }, [tokenConfigs, poolType, updatePool, boostableWhitelist, hasEditedPoolName, hasEditedPoolSymbol]);

  const MAX_NAME_LENGTH = chain?.id === sonic.id ? BEETS_MAX_POOL_NAME_LENGTH : MAX_POOL_NAME_LENGTH;

  return (
    <div className="flex flex-col gap-5">
      <ChooseTokenAmounts />

      <div>
        <div className="text-xl mb-3">Choose pool information:</div>
        <div className="flex flex-col gap-4">
          <div className="bg-base-100 p-3 rounded-xl">
            <TextField
              label="Pool name"
              placeholder="Enter pool name"
              value={name}
              maxLength={MAX_NAME_LENGTH}
              onChange={e => {
                updatePool({ name: e.target.value });
                updateUserData({ hasEditedPoolName: true });
              }}
            />
          </div>

          <div className="bg-base-100 p-3 rounded-xl">
            <TextField
              label="Pool symbol"
              placeholder="Enter pool symbol"
              value={symbol}
              maxLength={MAX_POOL_SYMBOL_LENGTH}
              onChange={e => {
                updatePool({ symbol: e.target.value.trim() });
                updateUserData({ hasEditedPoolSymbol: true });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
