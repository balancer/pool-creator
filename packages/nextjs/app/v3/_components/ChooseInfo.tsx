import React, { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert, TextField } from "~~/components/common";
import { useBoostableWhitelist, useCheckIfV3PoolExists, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from "~~/utils/constants";

/**
 * @dev Gauge creation reverts if the name is longer than 32 characters
 * https://github.com/balancer/pool-creator/issues/17#issuecomment-2430158673
 */
export const ChooseInfo = () => {
  const { name, symbol, tokenConfigs, poolType, updatePool } = usePoolCreationStore();
  const { updateUserData, hasEditedPoolName, hasEditedPoolSymbol } = useUserDataStore();
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

      if (!hasEditedPoolName) updatePool({ name: symbol.split("-").join(" ") });
      if (!hasEditedPoolSymbol) updatePool({ symbol });
    }
  }, [tokenConfigs, poolType, updatePool, boostableWhitelist, hasEditedPoolName, hasEditedPoolSymbol]);

  return (
    <div>
      <div className="text-xl mb-5">Choose pool information:</div>
      <div className="mb-5 flex flex-col gap-4">
        <div className="bg-base-100 p-3 rounded-xl">
          <TextField
            label="Pool name"
            placeholder="Enter pool name"
            value={name}
            maxLength={MAX_POOL_NAME_LENGTH}
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
      {existingPools && existingPools.length > 0 && (
        <div>
          <Alert type="warning">Warning: Pools with a similar configuration have already been created</Alert>
          <div className="overflow-x-auto mt-5">
            <table className="table w-full text-lg border border-neutral-500">
              <tbody>
                {existingPools.map(pool => {
                  const chainName = pool.chain.toLowerCase();
                  const baseURL = chainName === "sepolia" ? "https://test.balancer.fi" : "https://balancer.fi";
                  const poolURL = `${baseURL}/pools/${chainName}/v3/${pool.address}`;
                  return (
                    <tr key={pool.address}>
                      <td className="border border-neutral-500 px-2 py-1">{pool.name.slice(0, 20)}</td>
                      <td className="border border-neutral-500 px-2 py-1">{pool.symbol.slice(0, 20)}</td>
                      <td className="text-right border border-neutral-500 px-2 py-1">
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline text-info flex items-center gap-2 justify-end"
                          href={poolURL}
                        >
                          See Details
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
