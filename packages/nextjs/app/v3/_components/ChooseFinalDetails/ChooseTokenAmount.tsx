import React, { useEffect, useRef } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { useTokenUsdValue } from "~~/hooks/token";
import { type TokenConfig, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmount({ index, tokenConfig }: { index: number; tokenConfig: TokenConfig }) {
  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { tokenConfigs, poolType, updatePool, updateTokenConfig, eclpParams } = usePoolCreationStore();
  const { tokenInfo, amount, address, isWeightLocked } = tokenConfig;
  const weight = tokenConfig?.weight;
  const { usdValueToken0, usdValueToken1, isTokenOrderInverted } = eclpParams;

  const { address: connectedAddress } = useAccount();

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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (Number(inputValue) >= 0) {
      if (poolType === PoolType.GyroE) {
        // Use USD values to calculate proper amount for other token
        const otherIndex = index === 0 ? 1 : 0;

        // TODO: this is gross, make it better
        // If order is inverted, swap which price corresponds to which index
        const currentTokenPrice =
          index === 0
            ? Number(isTokenOrderInverted ? usdValueToken1 : usdValueToken0)
            : Number(isTokenOrderInverted ? usdValueToken0 : usdValueToken1);

        const otherTokenPrice =
          index === 0
            ? Number(isTokenOrderInverted ? usdValueToken0 : usdValueToken1)
            : Number(isTokenOrderInverted ? usdValueToken1 : usdValueToken0);

        const calculatedAmount = (Number(inputValue) * currentTokenPrice) / otherTokenPrice;

        updateTokenConfig(index, { amount: inputValue });
        updateTokenConfig(otherIndex, { amount: calculatedAmount.toString() });
      } else {
        updateTokenConfig(index, { amount: inputValue });
      }
    } else {
      updateTokenConfig(index, { amount: "" });
    }
  };

  const setAmountToUserBalance = () => {
    updateTokenConfig(index, { amount: formatUnits(userTokenBalance || 0n, tokenInfo?.decimals || 0) });
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

  const {
    tokenUsdValue,
    isLoading: isUsdValueLoading,
    isError: isUsdValueError,
  } = useTokenUsdValue(tokenInfo?.address, amount);

  let usdValue = null;
  // Handle edge case of if user altered token values for gyro eclp
  if (poolType === PoolType.GyroE) {
    if (isTokenOrderInverted) {
      if (index === 0) usdValue = Number(eclpParams.usdValueToken1);
      if (index === 1) usdValue = Number(eclpParams.usdValueToken0);
    } else {
      if (index === 0) usdValue = Number(eclpParams.usdValueToken0);
      if (index === 1) usdValue = Number(eclpParams.usdValueToken1);
    }
  } else {
    usdValue = tokenUsdValue;
  }

  return (
    <div className="bg-base-100 p-3 rounded-lg flex flex-col gap-3">
      <div className="flex gap-3 w-full items-center">
        {poolType === PoolType.Weighted && (
          <>
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
          </>
        )}

        <div className="flex-grow">
          <TokenAmountField
            inputValue={amount}
            usdValue={usdValue}
            isUsdValueLoading={isUsdValueLoading}
            isUsdValueError={isUsdValueError}
            selectedToken={tokenInfo}
            onChange={handleAmountChange}
            setAmountToUserBalance={setAmountToUserBalance}
            balance={userTokenBalance}
          />
        </div>
      </div>
    </div>
  );
}
