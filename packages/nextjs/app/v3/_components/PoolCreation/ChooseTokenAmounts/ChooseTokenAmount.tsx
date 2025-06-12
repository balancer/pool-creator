import React, { useEffect, useState } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useTokenUsdValue } from "~~/hooks/token";
import { type TokenConfig, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmount({ index, tokenConfig }: { index: number; tokenConfig: TokenConfig }) {
  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { poolType, updateTokenConfig, eclpParams, tokenConfigs } = usePoolCreationStore();
  const { tokenInfo, amount, address, weight } = tokenConfig;
  const { usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

  const [usdValue, setUsdValue] = useState<number | null>(null);

  const queryClient = useQueryClient();

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

  // Helper function to get rate-adjusted USD price for a token
  const getRateAdjustedUsdPrice = (tokenIndex: number) => {
    const rateProvider = tokenConfigs[tokenIndex].rateProvider;
    const rate: bigint | undefined = queryClient.getQueryData(["fetchTokenRate", rateProvider]);
    const basePrice = tokenIndex === 0 ? usdPerToken0 : usdPerToken1;

    if (!rate) return basePrice;
    return basePrice * Number(formatUnits(rate, 18));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (Number(inputValue) >= 0) {
      if (poolType === PoolType.GyroE) {
        const otherIndex = index === 0 ? 1 : 0;

        const referenceTokenPrice = getRateAdjustedUsdPrice(index);
        const otherTokenPrice = getRateAdjustedUsdPrice(otherIndex);

        const calculatedAmount = (Number(inputValue) * referenceTokenPrice) / otherTokenPrice;

        updateTokenConfig(index, { amount: inputValue });
        updateTokenConfig(otherIndex, { amount: calculatedAmount.toString() }); // update other token input to be proportional
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

  // Update USD value when amount changes
  useEffect(() => {
    if (poolType === PoolType.GyroE && amount) {
      const rateAdjustedPrice = getRateAdjustedUsdPrice(index);
      const rateAdjustedUsdValue = Number(amount) * rateAdjustedPrice;
      setUsdValue(rateAdjustedUsdValue);
    } else {
      setUsdValue(tokenUsdValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolType, amount, index, tokenUsdValue]);

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
