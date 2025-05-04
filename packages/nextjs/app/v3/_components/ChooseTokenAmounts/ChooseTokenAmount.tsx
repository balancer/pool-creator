import React, { useEffect } from "react";
import { TokenAmountField } from "./TokenAmountField";
import { PoolType } from "@balancer/sdk";
import { erc20Abi, formatUnits } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { useEclpSpotPrice } from "~~/hooks/gyro";
import { useTokenUsdValue } from "~~/hooks/token";
import { type TokenConfig, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseTokenAmount({ index, tokenConfig }: { index: number; tokenConfig: TokenConfig }) {
  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { poolType, updateTokenConfig, eclpParams } = usePoolCreationStore();
  const { tokenInfo, amount, address, weight } = tokenConfig;
  const { isEclpParamsInverted } = eclpParams;

  const { usdPerToken0, usdPerToken1 } = useEclpSpotPrice();
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
            ? Number(isEclpParamsInverted ? usdPerToken1 : usdPerToken0)
            : Number(isEclpParamsInverted ? usdPerToken0 : usdPerToken1);

        const otherTokenPrice =
          index === 0
            ? Number(isEclpParamsInverted ? usdPerToken0 : usdPerToken1)
            : Number(isEclpParamsInverted ? usdPerToken1 : usdPerToken0);

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

  const {
    tokenUsdValue,
    isLoading: isUsdValueLoading,
    isError: isUsdValueError,
  } = useTokenUsdValue(tokenInfo?.address, amount);

  console.log("tokenUsdValue", tokenUsdValue);

  let usdValue = null;
  // Handle edge case of if user altered token values for gyro eclp
  if (poolType === PoolType.GyroE) {
    const usdPerTokenAmount1 = Number(usdPerToken1) * Number(amount);
    const usdPerTokenAmount0 = Number(usdPerToken0) * Number(amount);
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
