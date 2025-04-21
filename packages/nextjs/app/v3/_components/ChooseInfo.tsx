import React, { useEffect } from "react";
import { ChooseTokenAmount } from "./ChooseTokenAmount";
import { PoolType } from "@balancer/sdk";
import { Alert, TextField } from "~~/components/common";
import {
  useBoostableWhitelist,
  usePoolCreationStore,
  useUserDataStore,
  useValidatePoolCreationInput,
} from "~~/hooks/v3";
import { BEETS_MAX_POOL_NAME_LENGTH, MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from "~~/utils/constants";
import { sonic } from "~~/utils/customChains";

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool, chain } = usePoolCreationStore();
  const { updateUserData, hasEditedPoolName, hasEditedPoolSymbol, hasAgreedToWarning } = useUserDataStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();
  const { isValidTokenWeights } = useValidatePoolCreationInput();
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
    <div>
      <div className="text-lg mb-3">Choose pool information:</div>
      <div className="mb-5 flex flex-col gap-4">
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

      <div className="text-lg mb-3">Choose initialization amounts:</div>
      <div className="flex flex-col gap-4">
        {Array.from({ length: tokenConfigs.length }).map((_, index) => (
          <ChooseTokenAmount key={index} index={index} />
        ))}
      </div>

      {poolType === PoolType.Weighted && (
        <div className="mt-5">
          <Alert type="warning">
            <label className="label cursor-pointer py-0 gap-3">
              <span className="">
                <span className="font-bold">Please Confirm:</span> USD values of amounts are proportional to token
                weights?
              </span>
              <input
                type="checkbox"
                className="checkbox rounded-lg border-neutral-700"
                onChange={() => {
                  updateUserData({ hasAgreedToWarning: !hasAgreedToWarning });
                }}
                checked={hasAgreedToWarning}
              />
            </label>
          </Alert>
        </div>
      )}

      {!isValidTokenWeights && (
        <div className="mt-5">
          <Alert type="error">Each token weight must be at least 1% and sum of all weights must be 100%</Alert>
        </div>
      )}
    </div>
  );
};
