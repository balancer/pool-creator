import React, { Dispatch, SetStateAction } from "react";
import { TokenType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { type Token } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";
import { bgBeigeGradient, bgPrimaryGradient } from "~~/utils";

export const BoostOpportunityModal = ({
  tokenIndex,
  setShowBoostOpportunityModal,
  boostedVariant,
  standardVariant,
}: {
  tokenIndex: number;
  setShowBoostOpportunityModal: Dispatch<SetStateAction<boolean>>;
  boostedVariant: Token;
  standardVariant: Token;
}) => {
  const { updateTokenConfig } = usePoolCreationStore();

  const boostedVariantRateProvider = boostedVariant.priceRateProviderData?.address;

  const handleConfirmBoost = () => {
    updateTokenConfig(tokenIndex, {
      useBoostedVariant: true,
      rateProvider: boostedVariantRateProvider ? boostedVariantRateProvider : zeroAddress,
      tokenType: TokenType.TOKEN_WITH_RATE,
      paysYieldFees: true,
    });
    setShowBoostOpportunityModal(false);
  };

  const handleDenyBoost = () => {
    updateTokenConfig(tokenIndex, {
      useBoostedVariant: false,
      rateProvider: zeroAddress,
      tokenType: TokenType.STANDARD,
      paysYieldFees: false,
    });

    setShowBoostOpportunityModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="w-[625px] min-h-[333px] bg-base-200 rounded-lg p-7 flex flex-col gap-5 items-center">
        <h3 className="font-bold text-3xl mb-5">{boostedVariant.name}</h3>
        <div className="text-xl mb-7 px-5">
          Boosted tokens provide your liquidity pool with a layer of sustainable yield. If you select{" "}
          <b>{boostedVariant.symbol}</b>, all <b>{standardVariant.symbol}</b> in this pool will be supplied to earn
          additional yield.
          <div className="mt-5">
            Note that if you choose the boosted variant, the necessary rate provider address will be auto-filled for you
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full">
          <button className={`btn ${bgBeigeGradient} rounded-xl text-lg`} onClick={() => handleDenyBoost()}>
            {standardVariant.symbol}
          </button>
          <button className={`btn ${bgPrimaryGradient} rounded-xl text-lg`} onClick={() => handleConfirmBoost()}>
            {boostedVariant.symbol}
          </button>
        </div>
      </div>
    </div>
  );
};
