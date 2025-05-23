import React, { useEffect } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useSortedTokenConfigs } from "~~/hooks/balancer";
import { useTokenUsdValue } from "~~/hooks/token";
import { type TokenConfig, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmount({ index, tokenConfig }: { index: number; tokenConfig: TokenConfig }) {
  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { poolType, updateTokenConfig, eclpParams } = usePoolCreationStore();
  const { tokenInfo, amount, address, weight } = tokenConfig;
  const { isEclpParamsInverted, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

  const queryClient = useQueryClient();
  const sortedTokenConfigs = useSortedTokenConfigs();

  const usdPerToken0 = Number(usdPerTokenInput0);
  const usdPerToken1 = Number(usdPerTokenInput1);

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

        const referenceRateProvider = sortedTokenConfigs[index].rateProvider;
        const otherRateProvider = sortedTokenConfigs[otherIndex].rateProvider;

        const referenceRate: bigint | undefined = queryClient.getQueryData(["fetchTokenRate", referenceRateProvider]);
        const otherRate: bigint | undefined = queryClient.getQueryData(["fetchTokenRate", otherRateProvider]);

        const tokenIndexToPrice = {
          0: isEclpParamsInverted ? usdPerToken1 : usdPerToken0,
          1: isEclpParamsInverted ? usdPerToken0 : usdPerToken1,
        };

        // Since using token per usd input values which will always be underlying or rate adjusted down, must adjust for rate here to properly calculate proportion
        let referenceTokenPrice = Number(tokenIndexToPrice[index as keyof typeof tokenIndexToPrice]);
        if (referenceRate) referenceTokenPrice = referenceTokenPrice * Number(formatUnits(referenceRate, 18));

        let otherTokenPrice = Number(tokenIndexToPrice[otherIndex]);
        if (otherRate) otherTokenPrice = otherTokenPrice * Number(formatUnits(otherRate, 18));

        const calculatedAmount = (Number(inputValue) * referenceTokenPrice) / otherTokenPrice;

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

  const {
    tokenUsdValue,
    isLoading: isUsdValueLoading,
    isError: isUsdValueError,
  } = useTokenUsdValue(tokenInfo?.address, amount);

  let usdValue = null;
  // Handle edge case of if user altered token values for gyro eclp
  if (poolType === PoolType.GyroE) {
    const usdPerTokenAmount1 = usdPerToken1 * Number(amount);
    const usdPerTokenAmount0 = usdPerToken0 * Number(amount);
    if (index === 0) usdValue = isEclpParamsInverted ? usdPerTokenAmount1 : usdPerTokenAmount0;
    if (index === 1) usdValue = isEclpParamsInverted ? usdPerTokenAmount0 : usdPerTokenAmount1;
  } else {
    usdValue = tokenUsdValue;
  }

  return (
    <div className="rounded-lg">
      <div className="flex gap-3 w-full items-center">
        {poolType === PoolType.Weighted && (
          <>
            <div className="w-full max-w-[80px] h-full flex flex-col relative">
              <input
                type="number"
                min="1"
                max="99"
                value={weight}
                disabled={true}
                className="input text-2xl text-center shadow-inner bg-base-300 rounded-xl w-full h-[77px] disabled:text-base-content"
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
            userTokenBalance={userTokenBalance}
          />
        </div>
      </div>
    </div>
  );
}
