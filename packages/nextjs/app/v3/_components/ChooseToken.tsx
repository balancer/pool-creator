import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import { PoolType, TokenType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { Cog6ToothIcon, InformationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Alert, Checkbox, TextField, TokenField } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { type BoostedTokenInfo, useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";
import { bgBeigeGradient, bgPrimaryGradient } from "~~/utils";

export function ChooseToken({ index }: { index: number }) {
  const [showBoostOpportunityModal, setShowBoostOpportunityModal] = useState(false);

  const { tokenConfigs, poolType, updatePool, updateTokenConfig } = usePoolCreationStore();
  const { tokenType, weight, rateProvider, tokenInfo, amount, address, useBoostedVariant } = tokenConfigs[index];
  const { balance: userTokenBalance } = useReadToken(tokenInfo?.address);
  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const { data: boostableWhitelist } = useBoostableWhitelist();
  const boostedVariant = boostableWhitelist?.[address];

  const handleTokenSelection = (tokenInfo: Token) => {
    updateTokenConfig(index, {
      address: tokenInfo.address,
      tokenType: TokenType.STANDARD,
      rateProvider: zeroAddress,
      paysYieldFees: false,
      tokenInfo: { ...tokenInfo },
      useBoostedVariant: false,
    });

    if (boostableWhitelist?.[tokenInfo.address]) {
      setShowBoostOpportunityModal(true);
    }
  };

  const handleTokenAmount = (amount: string) => {
    updateTokenConfig(index, { amount });
  };

  const handleTokenType = () => {
    if (tokenConfigs[index].tokenType === TokenType.STANDARD) {
      updateTokenConfig(index, { tokenType: TokenType.TOKEN_WITH_RATE, rateProvider: "", paysYieldFees: true });
    } else {
      updateTokenConfig(index, { tokenType: TokenType.STANDARD, rateProvider: zeroAddress, paysYieldFees: false });
    }
  };

  const handleRateProvider = (rateProvider: string) => {
    updateTokenConfig(index, { rateProvider });
  };

  // const handlePaysYieldFees = () => {
  //   updateTokenConfig(index, { paysYieldFees: !paysYieldFees });
  // };

  const handleRemoveToken = () => {
    if (tokenConfigs.length > 2) {
      const remainingTokenConfigs = [...tokenConfigs].filter((_, i) => i !== index);
      const updatedTokenConfigs = remainingTokenConfigs.map(token => {
        return { ...token, weight: 100 / remainingTokenConfigs.length };
      });
      updatePool({ tokenConfigs: updatedTokenConfigs });
    }
  };

  const isUpdatingWeights = useRef(false);

  const handleWeightChange = (newWeight: number) => {
    if (isUpdatingWeights.current) return;
    isUpdatingWeights.current = true;

    const adjustedWeight = Math.min(newWeight, 99);
    const remainingWeight = 100 - adjustedWeight;
    const evenWeight = remainingWeight / (tokenConfigs.length - 1);

    const updatedTokenConfigs = tokenConfigs.map((token, i) => ({
      ...token,
      weight: i === index ? adjustedWeight : evenWeight,
    }));

    updatePool({ tokenConfigs: updatedTokenConfigs });
    isUpdatingWeights.current = false;
  };

  return (
    <>
      <div className="bg-base-100 p-4 rounded-xl flex flex-col gap-3">
        <div className="flex gap-3 w-full items-center">
          {poolType === PoolType.Weighted && (
            <div className="w-full max-w-[80px] h-full flex flex-col relative">
              <input
                type="number"
                min="1"
                max="99"
                value={weight}
                onChange={e => handleWeightChange(Number(e.target.value))}
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
          {tokenConfigs.length > 2 && (
            <div className="cursor-pointer" onClick={handleRemoveToken}>
              <TrashIcon className="w-5 h-5" />
            </div>
          )}
        </div>

        <div>
          {tokenInfo && (
            // TODO: auto fill rate provider address if data available from API
            <div className="flex justify-between items-center mb-1">
              <div className="flex gap-1 items-center">
                <a
                  href="https://docs-v3.balancer.fi/concepts/core-concepts/rate-providers.html"
                  className="link"
                  target="_blank"
                  rel="noreferrer"
                >
                  <InformationCircleIcon className="w-5 h-5" />
                </a>
                <Checkbox
                  label={`Use a rate provider?`}
                  checked={tokenType === TokenType.TOKEN_WITH_RATE}
                  onChange={handleTokenType}
                />
              </div>

              {boostedVariant && (
                <div
                  className={`flex gap-1 items-center cursor-pointer ${
                    useBoostedVariant ? "text-accent" : "text-base-content"
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
            <div className="flex flex-col gap-4 mt-3">
              <TextField
                isRateProvider={true}
                mustBeAddress={true}
                placeholder={`Enter rate provider address for ${tokenInfo?.symbol}`}
                value={rateProvider !== zeroAddress ? rateProvider : ""}
                onChange={e => handleRateProvider(e.target.value)}
              />
              <Alert type="warning">
                Rate provider contracts must be reviewed before pool shows on{" "}
                <a href="https://balancer.fi/pools" className="link" target="_blank" rel="noreferrer">
                  balancer.fi
                </a>
              </Alert>

              {/* 
              <Checkbox
                label={`Should yield fees be charged on ${tokenInfo?.symbol}?`}
                checked={paysYieldFees}
                onChange={handlePaysYieldFees}
              /> 
              */}
            </div>
          )}
        </div>
      </div>
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

const BoostOpportunityModal = ({
  tokenIndex,
  setShowBoostOpportunityModal,
  boostedVariant,
  standardVariant,
}: {
  tokenIndex: number;
  setShowBoostOpportunityModal: Dispatch<SetStateAction<boolean>>;
  boostedVariant: BoostedTokenInfo;
  standardVariant: Token;
}) => {
  const { updateTokenConfig } = usePoolCreationStore();

  const handleBoost = (enableBoost: boolean) => {
    updateTokenConfig(tokenIndex, { useBoostedVariant: enableBoost });
    setShowBoostOpportunityModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="w-[625px] min-h-[333px] bg-base-300 rounded-lg p-7 flex flex-col gap-5 items-center">
        <h3 className="font-bold text-3xl mb-5">{boostedVariant.name}</h3>
        <div className="text-xl mb-7 px-5">
          Boosted tokens provide your liquidity pool with a layer of sustainable yield. If you select{" "}
          <b>{boostedVariant.symbol}</b>, all <b>{standardVariant.symbol}</b> in this pool will be supplied to
          Aave&apos;s lending market to earn additional yield.
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <button className={`btn ${bgBeigeGradient} rounded-xl text-lg`} onClick={() => handleBoost(false)}>
            {standardVariant.symbol}
          </button>
          <button className={`btn ${bgPrimaryGradient} rounded-xl text-lg`} onClick={() => handleBoost(true)}>
            {boostedVariant.symbol}
          </button>
        </div>
      </div>
    </div>
  );
};
