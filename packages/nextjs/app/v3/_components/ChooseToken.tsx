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

  const { tokenConfigs, setTokenConfigs, poolType } = usePoolCreationStore();
  const { tokenType, weight, rateProvider, paysYieldFees, tokenInfo, amount, address } = tokenConfigs[index];
  const { balance } = useReadToken(tokenInfo?.address);
  const { data } = useFetchTokenList();

  const tokenList = data || [];
  const remainingTokens = tokenList.filter(token => !tokenConfigs.some(config => config.address === token.address));

  const handleTokenSelection = (tokenInfo: Token) => {
    const updatedTokenConfigs = [...tokenConfigs];
    const tokenConfig = updatedTokenConfigs[index];
    tokenConfig.address = tokenInfo.address;
    tokenConfig.tokenType = TokenType.STANDARD;
    tokenConfig.rateProvider = zeroAddress;
    tokenConfig.paysYieldFees = false;
    tokenConfig.tokenInfo = { ...tokenInfo };
    updatedTokenConfigs[index] = tokenConfig;
    setTokenConfigs(updatedTokenConfigs);
  };

  const handleTokenAmount = (amount: string) => {
    const updatedTokenConfigs = [...tokenConfigs];
    updatedTokenConfigs[index].amount = amount;
    setTokenConfigs(updatedTokenConfigs);
  };

  const handleTokenType = () => {
    const updatedTokenConfigs = [...tokenConfigs];
    const tokenConfig = updatedTokenConfigs[index];
    if (tokenConfig.tokenType === TokenType.STANDARD) {
      tokenConfig.tokenType = TokenType.TOKEN_WITH_RATE;
      tokenConfig.rateProvider = "";
      tokenConfig.paysYieldFees = true;
    } else {
      tokenConfig.tokenType = TokenType.STANDARD;
      tokenConfig.rateProvider = zeroAddress;
      tokenConfig.paysYieldFees = false;
    }

    setTokenConfigs(updatedTokenConfigs);
  };

  const handleRateProvider = (rateProvider: string) => {
    const updatedTokenConfigs = [...tokenConfigs];
    updatedTokenConfigs[index].rateProvider = rateProvider;
    setTokenConfigs(updatedTokenConfigs);
  };

  const handlePaysYieldFees = () => {
    const updatedTokenConfigs = [...tokenConfigs];
    updatedTokenConfigs[index].paysYieldFees = !updatedTokenConfigs[index].paysYieldFees;
    setTokenConfigs(updatedTokenConfigs);
  };

  const handleRemoveToken = () => {
    if (tokenConfigs.length > 2) {
      const updatedTokenConfigs = [...tokenConfigs];
      updatedTokenConfigs.splice(index, 1);
      setTokenConfigs(updatedTokenConfigs);
    }
  };

  // When user changes one of the token weights, update the others to sum to 100
  useEffect(() => {
    const newWeight = tokenWeight;
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

    setTokenConfigs(updatedTokenConfigs);
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
        <div className="cursor-pointer" onClick={handleRemoveToken}>
          <TrashIcon className="w-5 h-5" />
        </div>
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
