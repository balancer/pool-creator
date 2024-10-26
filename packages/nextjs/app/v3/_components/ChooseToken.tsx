import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { TokenType } from "@balancer/sdk";
import { PoolType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { Cog6ToothIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Checkbox, TextField, TokenField } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";
import { bgBeigeGradient, bgPrimaryGradient } from "~~/utils";

export function ChooseToken({ index }: { index: number }) {
  const [showBoostOpportunityModal, setShowBoostOpportunityModal] = useState(false);

  const [tokenWeight, setTokenWeight] = useState<number>(50);

  const { tokenConfigs, poolType, updatePool, updateTokenConfig } = usePoolCreationStore();
  const { tokenType, weight, rateProvider, paysYieldFees, tokenInfo, amount, address, useBoostedVariant } =
    tokenConfigs[index];
  const { balance: userTokenBalance } = useReadToken(tokenInfo?.address);
  const { data } = useFetchTokenList();
  const { standardToBoosted } = useFetchBoostableTokens();
  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const boostedVariant = standardToBoosted[address];
  const { symbol: boostedSymbol, name: boostedName } = useReadToken(boostedVariant?.address);

  const handleTokenSelection = (tokenInfo: Token) => {
    const hasBoostedVariant = standardToBoosted[tokenInfo.address];
    if (hasBoostedVariant) {
      setShowBoostOpportunityModal(true);
    }
    updateTokenConfig(index, {
      address: tokenInfo.address,
      tokenType: TokenType.STANDARD,
      rateProvider: zeroAddress,
      paysYieldFees: false,
      tokenInfo: { ...tokenInfo },
      useBoostedVariant: false,
    });
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

  const handlePaysYieldFees = () => {
    updateTokenConfig(index, { paysYieldFees: !paysYieldFees });
  };

  const handleRemoveToken = () => {
    if (tokenConfigs.length > 2) {
      const remainingTokenConfigs = [...tokenConfigs].filter((_, i) => i !== index);
      const updatedTokenConfigs = remainingTokenConfigs.map(token => {
        return { ...token, weight: 100 / remainingTokenConfigs.length };
      });
      updatePool({ tokenConfigs: updatedTokenConfigs });
    }
  };

  // When user changes one of the token weights, update the others to sum to 100
  useEffect(() => {
    let newWeight = tokenWeight;
    if (newWeight > 98) newWeight = 98;
    const remainingWeight = 100 - newWeight;
    const remainingTokens = tokenConfigs.length - 1;
    const evenWeight = remainingWeight / remainingTokens;

    const updatedTokenConfigs = tokenConfigs.map((token, i) => {
      if (i === index) {
        return { ...token, weight: newWeight };
      } else {
        return { ...token, weight: evenWeight };
      }
    });

    updatePool({ tokenConfigs: updatedTokenConfigs });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenWeight]);

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
                onChange={e => setTokenWeight(Number(e.target.value))}
                className="input text-xl text-center shadow-inner bg-base-300 rounded-xl w-full h-[77px]"
              />
              <div className="absolute top-1 right-1 text-md text-neutral-400">%</div>
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

        {tokenInfo && (
          <div className="flex justify-between items-center">
            <Checkbox
              label={`Use a rate provider?`}
              checked={tokenType === TokenType.TOKEN_WITH_RATE}
              onChange={handleTokenType}
            />

            {boostedVariant && (
              <div
                className={`flex gap-1 items-center cursor-pointer ${
                  useBoostedVariant ? "text-success" : "text-warning"
                }`}
                onClick={() => setShowBoostOpportunityModal(true)}
              >
                {useBoostedVariant ? `Earning 3.5% with ${boostedSymbol}` : `Using standard ${tokenInfo.symbol}`}
                <Cog6ToothIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        )}

        {tokenType === TokenType.TOKEN_WITH_RATE && (
          <>
            <TextField
              mustBeAddress={true}
              placeholder={`Enter rate provider address for ${tokenInfo?.symbol}`}
              value={rateProvider !== zeroAddress ? rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
            <div className="flex gap-1 items-center">
              {/* <InformationCircleIcon className="w-5 h-5" /> */}
              <Checkbox
                label={`Should yield fees be charged on ${tokenInfo?.symbol}?`}
                checked={paysYieldFees}
                onChange={handlePaysYieldFees}
              />
            </div>
          </>
        )}
      </div>
      {showBoostOpportunityModal && tokenInfo && boostedSymbol && boostedName && (
        <BoostOpportunityModal
          tokenIndex={index}
          setShowBoostOpportunityModal={setShowBoostOpportunityModal}
          boostedSymbol={boostedSymbol}
          boostedName={boostedName}
        />
      )}
    </>
  );
}

const BoostOpportunityModal = ({
  tokenIndex,
  setShowBoostOpportunityModal,
  boostedSymbol,
  boostedName,
}: {
  tokenIndex: number;
  setShowBoostOpportunityModal: Dispatch<SetStateAction<boolean>>;
  boostedSymbol: string;
  boostedName: string;
}) => {
  const { tokenConfigs, updateTokenConfig } = usePoolCreationStore();
  const { tokenInfo } = tokenConfigs[tokenIndex];

  const handleBoost = (enableBoost: boolean) => {
    updateTokenConfig(tokenIndex, { useBoostedVariant: enableBoost });
    setShowBoostOpportunityModal(false);
  };

  if (!tokenInfo) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="w-[625px] min-h-[333px] bg-base-300 rounded-lg p-7 flex flex-col gap-5 items-center">
        <h3 className="font-bold text-3xl mb-5">{boostedName}</h3>
        <div className="text-xl mb-7 px-5">
          Boosted tokens provide your liquidity pool with a layer of sustainable yield. If you select{" "}
          <b>{boostedSymbol}</b>, all <b>{tokenInfo.symbol}</b> in this pool will be supplied to Aave&apos;s lending
          market to earn additional yield.
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <button className={`btn ${bgBeigeGradient} rounded-xl text-lg`} onClick={() => handleBoost(false)}>
            {tokenInfo.symbol}
          </button>
          <button className={`btn ${bgPrimaryGradient} rounded-xl text-lg`} onClick={() => handleBoost(true)}>
            {boostedSymbol}
          </button>
        </div>
      </div>
    </div>
  );
};
