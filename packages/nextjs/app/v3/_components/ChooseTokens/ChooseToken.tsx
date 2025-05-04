import React, { useEffect, useRef, useState } from "react";
import { BoostOpportunityModal } from "./BoostOpportunityModal";
import { RateProviderModal } from "./RateProviderModal";
import { PoolType, TokenType } from "@balancer/sdk";
import { erc20Abi, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { ChevronDownIcon, Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { LockClosedIcon, LockOpenIcon } from "@heroicons/react/24/outline";
import { Checkbox, TextField } from "~~/components/common";
import { Alert, TokenImage, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList } from "~~/hooks/token";
import {
  initialEclpParams,
  useBoostableWhitelist,
  usePoolCreationStore,
  useUserDataStore,
  useValidateRateProvider,
} from "~~/hooks/v3";

/**
 * This component manages:
 * 1. Token selection
 * 2. Optional rate provider
 * 3. Optional boost opportunity for underlying tokens that have whitelisted boosted variants
 * 4. If weighted pool, input to decide token weight
 */
export function ChooseToken({ index }: { index: number }) {
  const [showBoostOpportunityModal, setShowBoostOpportunityModal] = useState(false);
  const [showRateProviderModal, setShowRateProviderModal] = useState(false);
  const [isTokenSelectModalOpen, setIsTokenSelectModalOpen] = useState(false);

  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { tokenConfigs, updatePool, updateTokenConfig, poolType } = usePoolCreationStore();
  const {
    tokenType,
    rateProvider,
    isValidRateProvider,
    tokenInfo,
    address,
    useBoostedVariant,
    isWeightLocked,
    weight,
  } = tokenConfigs[index];

  useValidateRateProvider(rateProvider, index); // temp fix to trigger fetch, otherwise address user enters for rate provider is invalid

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
      currentRate: undefined,
      isValidRateProvider: false,
      tokenInfo: { ...tokenInfo },
      useBoostedVariant: false,
      paysYieldFees: false,
    });
    updatePool({ eclpParams: initialEclpParams }); // Don't remember why but this is needed?

    // If user switches token, these flags are reset to force auto-generation of pool name and symbol, at which point user can decide to modify
    updateUserData({
      hasEditedPoolName: false,
      hasEditedPoolSymbol: false,
      hasEditedEclpParams: false,
    });

    const hasBoostedVariant = boostableWhitelist?.[tokenInfo.address];
    if (hasBoostedVariant) setShowBoostOpportunityModal(true);
  };

  const handleTokenTypeToggle = () => {
    if (tokenConfigs[index].tokenType === TokenType.STANDARD) {
      updateTokenConfig(index, { tokenType: TokenType.TOKEN_WITH_RATE, rateProvider: "", paysYieldFees: true });
    } else {
      updateTokenConfig(index, {
        tokenType: TokenType.STANDARD,
        rateProvider: zeroAddress,
        paysYieldFees: false,
        useBoostedVariant: false,
      });
    }
  };

  const handleRemoveToken = () => {
    if (tokenConfigs.length > 2) {
      const remainingTokenConfigs = [...tokenConfigs].filter((_, i) => i !== index);
      updatePool({ tokenConfigs: remainingTokenConfigs });
    }
  };

  const isUpdatingWeights = useRef(false);

  const handleWeightChange = (newWeightString: string) => {
    if (isUpdatingWeights.current) return;
    isUpdatingWeights.current = true;

    const newWeight = Number(newWeightString);

    // The user's choice for the selected token's weight
    const adjustedWeight = Math.min(newWeight, 99);

    // Calculate total weight of locked tokens (excluding current token)
    const lockedWeight = tokenConfigs.reduce(
      (sum, token, i) => (i !== index && token.isWeightLocked ? sum + Number(token.weight) : sum),
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
      weight: i === index ? adjustedWeight.toString() : token.isWeightLocked ? token.weight : evenWeight.toString(),
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
    if (rateProviderData && !showBoostOpportunityModal && !token.isValidRateProvider) {
      // Constant rate providers are special case only used for gyro pools
      if (rateProviderData.name !== "ConstantRateProvider") {
        setShowRateProviderModal(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token.tokenInfo?.priceRateProviderData, token.useBoostedVariant, token.address, showBoostOpportunityModal]);

  return (
    <>
      <div className="bg-base-100 p-5 rounded-xl flex flex-col gap-3 relative">
        {boostedVariant && (
          <div
            className={`flex justify-end items-center gap-1 cursor-pointer absolute top-2 right-5 text-lg ${
              useBoostedVariant ? "text-success" : "text-info"
            }`}
            onClick={() => setShowBoostOpportunityModal(true)}
          >
            <Cog6ToothIcon className="w-5 h-5" />
            {useBoostedVariant ? `Earning yield with ${boostedVariant.symbol}` : `Using standard variant`}
          </div>
        )}
        <div className="flex gap-3 w-full items-center">
          <div className="flex flex-grow justify-between items-end">
            <div className="flex gap-3 items-center">
              {(tokenConfigs.length > 2 || poolType === PoolType.Weighted) && (
                <div className="flex flex-col gap-3">
                  {poolType === PoolType.Weighted && (
                    <>
                      <div className="">
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
                    </>
                  )}
                  {tokenConfigs.length > 2 && (
                    <div className="cursor-pointer" onClick={handleRemoveToken}>
                      <TrashIcon className="w-5 h-5" />
                    </div>
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
                    onChange={e => handleWeightChange(Math.max(0, Number(e.target.value.trim())).toString())}
                    className="input text-2xl text-center shadow-inner bg-base-300 rounded-xl w-full h-[60px]"
                  />
                  <div className="absolute top-1.5 right-1.5 text-md text-neutral-400">%</div>
                </div>
              )}

              <button
                onClick={() => setIsTokenSelectModalOpen(true)}
                className={`${
                  tokenInfo
                    ? "bg-base-300"
                    : "text-neutral-700 bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100%"
                } h-[60px] py-3 px-4 shadow-md disabled:text-base-content text-lg font-bold rounded-lg flex justify-between items-center gap-3`}
              >
                {tokenInfo && <TokenImage size="md" token={tokenInfo} />}
                {tokenInfo?.symbol ? `${tokenInfo.symbol}` : `Select Token`}{" "}
                {<ChevronDownIcon className="w-4 h-4 mt-0.5" />}
              </button>
            </div>

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
        </div>
        {tokenInfo && tokenType === TokenType.TOKEN_WITH_RATE && (
          <div className="flex flex-col gap-3">
            <TextField
              isRateProvider={true}
              isValidRateProvider={isValidRateProvider}
              mustBeAddress={true}
              placeholder={`Enter rate provider address for ${tokenInfo?.symbol}`}
              value={rateProvider !== zeroAddress ? rateProvider : ""}
              onChange={e => updateTokenConfig(index, { rateProvider: e.target.value.trim() })}
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

      {isTokenSelectModalOpen && remainingTokens && handleTokenSelection && (
        <TokenSelectModal
          tokenOptions={remainingTokens}
          setToken={handleTokenSelection}
          setIsModalOpen={setIsTokenSelectModalOpen}
        />
      )}
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
