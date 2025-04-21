import React, { useEffect, useRef } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { erc20Abi } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { useFetchTokenList } from "~~/hooks/token";
import { usePoolCreationStore, useUserDataStore, useValidateRateProvider } from "~~/hooks/v3";

export function ChooseTokenAmount({ index }: { index: number }) {
  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { tokenConfigs, poolType, updatePool, updateTokenConfig } = usePoolCreationStore();
  const { weight, rateProvider, tokenInfo, amount, address, isWeightLocked } = tokenConfigs[index];

  useValidateRateProvider(rateProvider, index); // temp fix to trigger fetch, otherwise address user enters for rate provider is invalid

  const { address: connectedAddress } = useAccount();
  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const { data: userTokenBalance } = useReadContract({
    address,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: connectedAddress ? [connectedAddress] : undefined,
  });

  useEffect(() => {
    updateUserData({ userTokenBalances: { ...userTokenBalances, [address]: userTokenBalance?.toString() ?? "0" } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userTokenBalance, address]);

  const handleTokenAmount = (amount: string) => {
    updateTokenConfig(index, { amount });
  };

  const isUpdatingWeights = useRef(false);

  const handleWeightChange = (newWeight: number) => {
    if (isUpdatingWeights.current) return;
    isUpdatingWeights.current = true;

    // The user's choice for the selected token's weight
    const adjustedWeight = Math.min(newWeight, 99);

    // Calculate total weight of locked tokens (excluding current token)
    const lockedWeight = tokenConfigs.reduce(
      (sum, token, i) => (i !== index && token.isWeightLocked ? sum + (token?.weight ?? 0) : sum),
      0,
    );

    // Count unlocked tokens (excluding current token)
    const unlockedTokenCount = tokenConfigs.reduce(
      (count, token, i) => (i !== index && !token.isWeightLocked ? count + 1 : count),
      0,
    );

    const remainingWeight = 100 - adjustedWeight - lockedWeight;
    const evenWeight = unlockedTokenCount > 0 ? remainingWeight / unlockedTokenCount : 0;

    const updatedTokenConfigs = tokenConfigs.map((token, i) => ({
      ...token,
      weight: i === index ? adjustedWeight : token.isWeightLocked ? token.weight : evenWeight,
    }));

    updatePool({ tokenConfigs: updatedTokenConfigs });
    isUpdatingWeights.current = false;
  };

  return (
    <>
      <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex gap-3 w-full items-center">
          {poolType === PoolType.Weighted && (
            <div className="flex flex-col gap-5 justify-between items-center">
              {isWeightLocked ? (
                <LockClosedIcon
                  onClick={() => updateTokenConfig(index, { isWeightLocked: false })}
                  className="w-5 h-5 cursor-pointer"
                />
              ) : (
                <LockOpenIcon
                  onClick={() => updateTokenConfig(index, { isWeightLocked: true })}
                  className="w-5 h-5 cursor-pointer"
                />
              )}
            </div>
          )}

          {poolType === PoolType.Weighted && (
            <div className="w-full max-w-[80px] h-full flex flex-col relative">
              <input
                type="number"
                min="1"
                max="99"
                value={weight}
                onChange={e => handleWeightChange(Math.max(0, Number(e.target.value.trim())))}
                className="input text-2xl text-center shadow-inner bg-base-300 rounded-xl w-full h-[77px]"
              />
              <div className="absolute top-1.5 right-1.5 text-md text-neutral-400">%</div>
            </div>
          )}
          <div className="flex-grow">
            <TokenAmountField
              value={amount}
              selectedToken={tokenInfo}
              setTokenAmount={handleTokenAmount}
              tokenOptions={remainingTokens}
              balance={userTokenBalance}
            />
          </div>
        </div>
      </div>
    </>
  );
}
