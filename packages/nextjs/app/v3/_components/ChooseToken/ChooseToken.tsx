import React, { useEffect, useRef, useState } from "react";
import { BoostOpportunityModal, RateProviderModal } from "./";
import { PoolType, TokenType, erc20Abi } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { Cog6ToothIcon, LockClosedIcon, LockOpenIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Alert, Checkbox, TextField, TokenField } from "~~/components/common";
import { type Token, useFetchTokenList } from "~~/hooks/token";
import { useBoostableWhitelist, usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export function ChooseToken({ index }: { index: number }) {
  const [showBoostOpportunityModal, setShowBoostOpportunityModal] = useState(false);
  const [showRateProviderModal, setShowRateProviderModal] = useState(false);

  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { tokenConfigs, poolType, updatePool, updateTokenConfig } = usePoolCreationStore();
  const {
    tokenType,
    weight,
    rateProvider,
    isValidRateProvider,
    tokenInfo,
    amount,
    address,
    useBoostedVariant,
    isWeightLocked,
    paysYieldFees,
  } = tokenConfigs[index];

  const { address: connectedAddress } = useAccount();
  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const { data: boostableWhitelist } = useBoostableWhitelist();
  const boostedVariant = boostableWhitelist?.[address];

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

  const handleTokenSelection = (tokenInfo: Token) => {
    // upon initial selection of token, start with default values
    updateTokenConfig(index, {
      address: tokenInfo.address,
      tokenType: TokenType.STANDARD,
      rateProvider: zeroAddress,
      tokenInfo: { ...tokenInfo },
      useBoostedVariant: false,

      paysYieldFees: false,
    });

    // If user switches token, this will force trigger auto-generation of pool name and symbol, at which point user can decide to modify
    updateUserData({ hasEditedPoolName: false, hasEditedPoolSymbol: false, hasEditedEclpParams: false });

    const hasBoostedVariant = boostableWhitelist?.[tokenInfo.address];
    if (hasBoostedVariant) {
      setShowBoostOpportunityModal(true);
    }
  };

  const handleTokenAmount = (amount: string) => {
    updateTokenConfig(index, { amount });
  };

  const handleTokenTypeToggle = () => {
    if (tokenConfigs[index].tokenType === TokenType.STANDARD) {
      updateTokenConfig(index, { tokenType: TokenType.TOKEN_WITH_RATE, rateProvider: "", paysYieldFees: true });
    } else {
      updateTokenConfig(index, { tokenType: TokenType.STANDARD, rateProvider: zeroAddress, paysYieldFees: false });
    }
  };

  const handleRemoveToken = () => {
    if (tokenConfigs.length > 2) {
      const remainingTokenConfigs = [...tokenConfigs].filter((_, i) => i !== index);

      // Calculate total weight of locked tokens
      const lockedWeight = remainingTokenConfigs.reduce(
        (sum, token) => (token.isWeightLocked ? sum + token.weight : sum),
        0,
      );

      // Count unlocked tokens
      const unlockedTokenCount = remainingTokenConfigs.reduce(
        (count, token) => (!token.isWeightLocked ? count + 1 : count),
        0,
      );

      // Distribute remaining weight evenly among unlocked tokens
      const remainingWeight = 100 - lockedWeight;
      const evenWeight = unlockedTokenCount > 0 ? remainingWeight / unlockedTokenCount : 0;

      const updatedTokenConfigs = remainingTokenConfigs.map(token => ({
        ...token,
        weight: token.isWeightLocked ? token.weight : evenWeight,
      }));

      updatePool({ tokenConfigs: updatedTokenConfigs });
    }
  };

  const isUpdatingWeights = useRef(false);

  const handleWeightChange = (newWeight: number) => {
    if (isUpdatingWeights.current) return;
    isUpdatingWeights.current = true;

    // The user's choice for the selected token's weight
    const adjustedWeight = Math.min(newWeight, 99);

    // Calculate total weight of locked tokens (excluding current token)
    const lockedWeight = tokenConfigs.reduce(
      (sum, token, i) => (i !== index && token.isWeightLocked ? sum + token.weight : sum),
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

  // show rate provider modal when appropriate
  const token = tokenConfigs[index];
  useEffect(() => {
    let rateProviderData = token.tokenInfo?.priceRateProviderData;
    // if user opted to use boosted variant of underlying token, offer the rate provider from the boosted variant
    if (token.useBoostedVariant) {
      const boostedVariant = boostableWhitelist?.[token.address];
      rateProviderData = boostedVariant?.priceRateProviderData;
    }

    // if rate provider data exists for the token and user is not currently seeing the boost opportunity modal, show rate provider modal
    if (rateProviderData && !showBoostOpportunityModal) {
      // Constant rate providers are special case only used for gyro pools
      if (rateProviderData.name !== "ConstantRateProvider") {
        setShowRateProviderModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.tokenInfo?.priceRateProviderData, token.useBoostedVariant, token.address, showBoostOpportunityModal]);

  return (
    <>
      <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex gap-3 w-full items-center">
          <div className="flex flex-col gap-5 justify-between items-center">
            {poolType === PoolType.Weighted &&
              (isWeightLocked ? (
                <LockClosedIcon
                  onClick={() => updateTokenConfig(index, { isWeightLocked: false })}
                  className="w-5 h-5 cursor-pointer"
                />
              ) : (
                <LockOpenIcon
                  onClick={() => updateTokenConfig(index, { isWeightLocked: true })}
                  className="w-5 h-5 cursor-pointer"
                />
              ))}
            {tokenConfigs.length > 2 && (
              <div className="cursor-pointer" onClick={handleRemoveToken}>
                <TrashIcon className="w-5 h-5" />
              </div>
            )}
          </div>

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
            <div>
              <div className="flex gap-3 items-center">
                <TokenField
                  value={amount}
                  selectedToken={tokenInfo}
                  setToken={handleTokenSelection}
                  setTokenAmount={handleTokenAmount}
                  tokenOptions={remainingTokens}
                  balance={userTokenBalance}
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          {tokenInfo && (
            <div className="flex justify-between items-center mb-1 mt-2">
              <div className="flex gap-1 items-center">
                <Checkbox
                  label={
                    <a
                      href="https://docs-v3.balancer.fi/partner-onboarding/onboarding-overview/rate-providers.html"
                      className="link no-underline flex items-center gap-1 text-lg"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Use a <span className="underline">rate provider</span>?
                    </a>
                  }
                  checked={tokenType === TokenType.TOKEN_WITH_RATE}
                  onChange={handleTokenTypeToggle}
                />
              </div>

              {boostedVariant && (
                <div
                  className={`flex gap-1 items-center cursor-pointer ${
                    useBoostedVariant ? "text-info" : "text-base-content"
                  }`}
                  onClick={() => setShowBoostOpportunityModal(true)}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  {useBoostedVariant
                    ? `Earning yield with ${boostedVariant.symbol}`
                    : `Using standard ${tokenInfo.symbol}`}
                </div>
              )}
            </div>
          )}

          {tokenType === TokenType.TOKEN_WITH_RATE && (
            <div className="flex flex-col gap-4 mt-5">
              <TextField
                isRateProvider={true}
                isValidRateProvider={isValidRateProvider}
                mustBeAddress={true}
                placeholder={`Enter rate provider address for ${tokenInfo?.symbol}`}
                value={rateProvider !== zeroAddress ? rateProvider : ""}
                onChange={e => updateTokenConfig(index, { rateProvider: e.target.value.trim() })}
              />
              <Checkbox
                label={`Should yield fees be charged on ${tokenInfo?.symbol}?`}
                checked={paysYieldFees}
                onChange={() => updateTokenConfig(index, { paysYieldFees: !paysYieldFees })}
              />

              {rateProvider.toLowerCase() !== tokenInfo?.priceRateProviderData?.address.toLowerCase() &&
                !(
                  useBoostedVariant &&
                  boostedVariant?.priceRateProviderData?.address.toLowerCase() === rateProvider.toLowerCase()
                ) && (
                  <Alert type="warning">
                    Rate provider contracts{" "}
                    <a
                      href="https://docs-v3.balancer.fi/partner-onboarding/onboarding-overview/rate-providers.html"
                      className="link items-center gap-1 "
                      target="_blank"
                      rel="noreferrer"
                    >
                      must be reviewed
                    </a>{" "}
                    before pool visibility on{" "}
                    <a href="https://balancer.fi/pools" className="link" target="_blank" rel="noreferrer">
                      balancer.fi
                    </a>
                  </Alert>
                )}
            </div>
          )}
        </div>
      </div>
      {showRateProviderModal && tokenInfo && (
        <RateProviderModal setShowRateProviderModal={setShowRateProviderModal} tokenIndex={index} />
      )}
      {showBoostOpportunityModal && tokenInfo && boostedVariant && (
        <BoostOpportunityModal
          tokenIndex={index}
          standardVariant={tokenInfo}
          boostedVariant={boostedVariant}
          setShowBoostOpportunityModal={setShowBoostOpportunityModal}
        />
      )}
    </>
  );
}
