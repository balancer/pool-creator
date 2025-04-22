import React, { useEffect, useState } from "react";
import { BoostOpportunityModal } from "./BoostOpportunityModal";
import { RateProviderModal } from "./RateProviderModal";
import { TokenType } from "@balancer/sdk";
import { erc20Abi, zeroAddress } from "viem";
import { useAccount, useReadContract } from "wagmi";
import { ChevronDownIcon, Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Checkbox, TextField } from "~~/components/common";
import { Alert, TokenImage, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList } from "~~/hooks/token";
import { useBoostableWhitelist, usePoolCreationStore, useUserDataStore, useValidateRateProvider } from "~~/hooks/v3";

/**
 * This component manages:
 * 1. Token selection
 * 2. Optional rate provider
 * 3. Optional boost opportunity for underlying tokens that have whitelisted boosted variants
 */
export function ChooseToken({ index }: { index: number }) {
  const [showBoostOpportunityModal, setShowBoostOpportunityModal] = useState(false);
  const [showRateProviderModal, setShowRateProviderModal] = useState(false);
  const [isTokenSelectModalOpen, setIsTokenSelectModalOpen] = useState(false);

  const { updateUserData, userTokenBalances } = useUserDataStore();
  const { tokenConfigs, updatePool, updateTokenConfig } = usePoolCreationStore();
  const { tokenType, rateProvider, isValidRateProvider, tokenInfo, address, useBoostedVariant, paysYieldFees } =
    tokenConfigs[index];

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
          {tokenConfigs.length > 2 && (
            <div className="cursor-pointer" onClick={handleRemoveToken}>
              <TrashIcon className="w-5 h-5" />
            </div>
          )}

          <div className="flex flex-grow justify-between items-end">
            <button
              onClick={() => setIsTokenSelectModalOpen(true)}
              className={`${
                tokenInfo
                  ? "bg-base-300"
                  : "text-neutral-700 bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100%"
              } py-3 px-4 shadow-md disabled:text-base-content text-lg font-bold rounded-lg flex justify-between items-center gap-3`}
            >
              {tokenInfo && <TokenImage size="md" token={tokenInfo} />}
              {tokenInfo?.symbol ? `${tokenInfo.symbol}` : `Select Token`}{" "}
              {<ChevronDownIcon className="w-4 h-4 mt-0.5" />}
            </button>

            <Checkbox
              label={
                <a
                  href="https://docs-v3.balancer.fi/partner-onboarding/onboarding-overview/rate-providers.html"
                  className="link no-underline flex items-center gap-1 text-lg"
                  target="_blank"
                  rel="noreferrer"
                >
                  Should this token use a <span className="underline">rate provider</span>?
                </a>
              }
              checked={tokenType === TokenType.TOKEN_WITH_RATE}
              onChange={handleTokenTypeToggle}
            />
          </div>
        </div>
        {tokenInfo && tokenType === TokenType.TOKEN_WITH_RATE && (
          <div className="flex flex-col items-end gap-3">
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

            <Checkbox
              label={`Should yield fees be charged on ${tokenInfo?.symbol}?`}
              checked={paysYieldFees}
              onChange={() => updateTokenConfig(index, { paysYieldFees: !paysYieldFees })}
            />
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
