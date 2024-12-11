import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { ArrowTopRightOnSquareIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useBoostableWhitelist, useCheckIfV3PoolExists, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH } from "~~/utils/constants";

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool } = usePoolCreationStore();
  const { updateUserData, hasEditedPoolInformation } = useUserDataStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const { existingPools } = useCheckIfV3PoolExists(
    poolType,
    tokenConfigs.map(token => token.address),
  );

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

      if (!hasEditedPoolInformation) {
        updatePool({ name: symbol.split("-").join(" ") });
      }

      updatePool({
        symbol,
      });
    }
  }, [tokenConfigs, poolType, updatePool, boostableWhitelist, hasEditedPoolInformation]);

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
            onChange={e => {
              updatePool({ name: e.target.value });
              updateUserData({ hasEditedPoolInformation: true });
            }}
          />
        </div>

        <div className="bg-base-100 p-5 rounded-xl">
          <TextField
            label="Pool symbol"
            placeholder="Enter pool symbol"
            value={symbol}
            onChange={e => {
              updatePool({ symbol: e.target.value.trim() });
              updateUserData({ hasEditedPoolInformation: true });
            }}
          />
        </div>
      </div>
      {existingPools && existingPools.length > 0 && (
        <Alert showIcon={false} type="warning">
          <div className="mb-3 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5" /> Warning: The following pools have already been created with
            a similar configuration
          </div>
          <ol className="">
            {/* TODO: Replace with production link instead of test.balancer.fi */}
            {existingPools.map(pool => (
              <li key={pool.address}>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-500 flex justify-end items-center gap-2"
                  href={`https://test.balancer.fi/pools/${pool.chain.toLowerCase()}/v3/${pool.address}`}
                >
                  {pool.symbol}
                  <ArrowTopRightOnSquareIcon className="w-4 h-4 mt-0.5" />
                </a>
              </li>
            ))}
          </ol>
        </Alert>
      )}
    </div>
  );
};
