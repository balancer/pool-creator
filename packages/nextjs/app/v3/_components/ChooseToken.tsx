import React, { useEffect, useState } from "react";
import { TokenType } from "../../../hooks/v3/types";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { Checkbox, RadioInput, TextField, TokenField, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { usePoolStore } from "~~/hooks/v3";

// TODO: figure out how to hold onto state for this component
// it currently resets when moving between pool configuration tabs
export function ChooseToken({ index }: { index: number }) {
  const { tokenConfigs, setTokenConfigs } = usePoolStore();
  const { tokenType, weight, rateProvider, paysYieldFees, tokenInfo } = tokenConfigs[index];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [tokenWeight, setTokenWeight] = useState<number>(50);

  const { balance } = useReadToken(tokenInfo?.address);
  const { data } = useFetchTokenList();
  const tokenOptions = data || [];

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

  const handleTokenType = (tokenType: TokenType) => {
    const updatedTokenConfigs = [...tokenConfigs];
    updatedTokenConfigs[index].tokenType = tokenType;
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

  // When user changes one of the token weights, update the others to sum to 100
  useEffect(() => {
    const newWeight = tokenWeight;
    const remainingWeight = 100 - newWeight;
    const remainingTokens = tokenConfigs.length - 1;
    const evenWeight = remainingWeight / remainingTokens;

    const updatedTokenConfigs = tokenConfigs.map((token, i) => {
      if (i === index) {
        return { ...token, weight: parseUnits(newWeight.toString(), 16) };
      } else {
        return { ...token, weight: parseUnits(evenWeight.toString(), 16) };
      }
    });

    setTokenConfigs(updatedTokenConfigs);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenWeight]);

  return (
    <div>
      <div className="flex gap-3 w-full">
        <div className="w-full max-w-[80px] flex flex-col">
          {index === 0 && (
            <label className="label">
              <span className="label-text text-lg">Weight</span>
            </label>
          )}
          <input
            type="number"
            min="0"
            max="99"
            value={Number(formatUnits(weight, 16)).toFixed(0)}
            onChange={e => setTokenWeight(Number(e.target.value))}
            className="input text-2xl text-center shadow-inner bg-base-300 rounded-xl h-full w-full"
          />
        </div>
        <div className="flex-grow">
          {index === 0 && (
            <label className="label">
              <span className="label-text text-lg">Token</span>
            </label>
          )}
          <TokenField
            value={tokenAmount}
            selectedToken={tokenInfo}
            setToken={handleTokenSelection}
            setTokenAmount={setTokenAmount}
            tokenOptions={tokenOptions}
            balance={balance}
          />
        </div>
        <div className="flex flex-col text-xl">
          {index === 0 && (
            <label className="label">
              <span className="label-text text-lg">Type</span>
            </label>
          )}
          <RadioInput
            name={`token-type-${index}`}
            label="Standard"
            checked={tokenType === TokenType.STANDARD}
            onChange={() => handleTokenType(TokenType.STANDARD)}
          />
          <RadioInput
            name={`token-type-${index}`}
            label="With Rate"
            checked={tokenType === TokenType.WITH_RATE}
            onChange={() => handleTokenType(TokenType.WITH_RATE)}
          />
        </div>
      </div>
      {tokenType === TokenType.WITH_RATE && (
        <div className="flex items-end gap-3">
          <div className="flex-grow mt-2">
            <TextField
              label={`${tokenInfo?.symbol} Rate Provider`}
              placeholder="Enter rate provider address"
              value={rateProvider !== zeroAddress ? rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
          </div>
          <Checkbox label="Pays Yield Fees" checked={paysYieldFees} onChange={handlePaysYieldFees} />
        </div>
      )}

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={handleTokenSelection} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
