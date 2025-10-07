import React, { useEffect, useState } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useEclpSpotPrice } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { type TokenConfig, useFetchTokenRate, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { formatNumberToFixedDecimal } from "~~/utils";
import { getEclpInitAmountsRatio } from "~~/utils/gryo";

export function ChooseTokenAmount({
  index,
  tokenConfig,
  autofillAmount,
}: {
  index: number;
  tokenConfig: TokenConfig;
  autofillAmount: boolean;
}) {
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

  const { data: rateTokenA } = useFetchTokenRate(tokenConfigs[0].rateProvider);
  const { data: rateTokenB } = useFetchTokenRate(tokenConfigs[1].rateProvider);

  const { poolSpotPrice } = useEclpSpotPrice();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (Number(e.target.value) >= 0) {
      if (poolType === PoolType.GyroE && autofillAmount) {
        // app forces tokens to be sorted before offering init amounts inputs
        const isReferenceAmountForTokenA = index === 0;
        const otherIndex = isReferenceAmountForTokenA ? 1 : 0;

        const initAmountsRatio = getEclpInitAmountsRatio({
          alpha: Number(eclpParams.alpha),
          beta: Number(eclpParams.beta),
          c: Number(eclpParams.c),
          s: Number(eclpParams.s),
          lambda: Number(eclpParams.lambda),
          rateA: rateTokenA ? +formatUnits(rateTokenA, 18) : 1,
          rateB: rateTokenB ? +formatUnits(rateTokenB, 18) : 1,
          spotPriceWithoutRate: poolSpotPrice,
        });
        if (!initAmountsRatio) return;

        const referenceAmount = Number(e.target.value);
        const otherTokenAmount = isReferenceAmountForTokenA
          ? referenceAmount / initAmountsRatio // If entering tokenA, divide to get tokenB amount
          : referenceAmount * initAmountsRatio; // If entering tokenB, multiply to get tokenA amount

        // Convert to fixed decimal string to avoid scientific notation
        const formattedAmount = formatNumberToFixedDecimal(Math.abs(otherTokenAmount));
        updateTokenConfig(otherIndex, { amount: formattedAmount });
      }
      updateTokenConfig(index, { amount: e.target.value });
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
