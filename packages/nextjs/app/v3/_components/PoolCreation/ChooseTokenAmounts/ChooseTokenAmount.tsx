import React, { useEffect } from "react";
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

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.trim();
    if (Number(inputValue) >= 0) {
      if (poolType === PoolType.GyroE) {
        // Use USD values to calculate proper amount for other token
        const otherIndex = index === 0 ? 1 : 0;

        const referenceRateProvider = tokenConfigs[index].rateProvider;
        const otherRateProvider = tokenConfigs[otherIndex].rateProvider;

        const referenceRate: bigint | undefined = queryClient.getQueryData(["fetchTokenRate", referenceRateProvider]);
        const otherRate: bigint | undefined = queryClient.getQueryData(["fetchTokenRate", otherRateProvider]);

        // Get the correct USD price for each token based on their index
        const referenceTokenPrice = index === 0 ? usdPerToken0 : usdPerToken1;
        const otherTokenPrice = otherIndex === 0 ? usdPerToken0 : usdPerToken1;

        // Since using token per usd input values which will always be underlying or rate adjusted down, must adjust for rate here to properly calculate proportion
        let adjustedReferenceTokenPrice = referenceTokenPrice;
        if (referenceRate)
          adjustedReferenceTokenPrice = adjustedReferenceTokenPrice * Number(formatUnits(referenceRate, 18));

        let adjustedOtherTokenPrice = otherTokenPrice;
        if (otherRate) adjustedOtherTokenPrice = adjustedOtherTokenPrice * Number(formatUnits(otherRate, 18));

        const calculatedAmount = (Number(inputValue) * adjustedReferenceTokenPrice) / adjustedOtherTokenPrice;

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
    const usdPerTokenAmount = index === 0 ? usdPerToken0 * Number(amount) : usdPerToken1 * Number(amount);
    usdValue = usdPerTokenAmount;
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
