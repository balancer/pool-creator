import React, { useEffect, useState } from "react";
import { TokenType } from "@balancer/sdk";
import { PoolType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { InformationCircleIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Checkbox, TextField, TokenField } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { usePoolCreationStore } from "~~/hooks/v3";

export function ChooseToken({ index }: { index: number }) {
  const [tokenWeight, setTokenWeight] = useState<number>(50);

  const { tokenConfigs, poolType, updatePool, updateTokenConfig } = usePoolCreationStore();
  const { tokenType, weight, rateProvider, paysYieldFees, tokenInfo, amount, address } = tokenConfigs[index];
  const { balance } = useReadToken(tokenInfo?.address);
  const { data } = useFetchTokenList();

  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const handleTokenSelection = (tokenInfo: Token) => {
    updateTokenConfig(index, {
      address: tokenInfo.address,
      tokenType: TokenType.STANDARD,
      rateProvider: zeroAddress,
      paysYieldFees: false,
      tokenInfo: { ...tokenInfo },
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
      const updatedTokenConfigs = [...tokenConfigs];
      updatedTokenConfigs.splice(index, 1);
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
    <div className="bg-base-100 p-4 rounded-xl">
      <div className="flex gap-3 w-full items-center">
        {poolType === PoolType.Weighted && (
          <div className="w-full max-w-[80px] h-full flex flex-col">
            <input
              type="number"
              min="1"
              max="99"
              value={weight}
              onChange={e => setTokenWeight(Number(e.target.value))}
              className="input text-2xl text-center shadow-inner bg-base-300 rounded-xl w-full h-[77px]"
            />
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
                balance={balance}
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

      {address && (
        <div className="flex gap-1 items-center mt-2">
          <InformationCircleIcon className="w-5 h-5" />
          <Checkbox
            label={`Does ${tokenInfo?.symbol} require a rate provider?`}
            checked={tokenType === TokenType.TOKEN_WITH_RATE}
            onChange={handleTokenType}
          />
        </div>
      )}

      {tokenType === TokenType.TOKEN_WITH_RATE && (
        <div>
          <div className="my-1">
            <TextField
              mustBeAddress={true}
              label="Rate provider"
              placeholder="Enter rate provider address"
              value={rateProvider !== zeroAddress ? rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
          </div>

          <div className="flex gap-1 items-center">
            <InformationCircleIcon className="w-5 h-5" />
            <Checkbox
              label={`Should yield fees be charged on ${tokenInfo?.symbol}?`}
              checked={paysYieldFees}
              onChange={handlePaysYieldFees}
            />
          </div>
        </div>
      )}
    </div>
  );
}
