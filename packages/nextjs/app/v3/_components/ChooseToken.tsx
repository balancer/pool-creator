import React, { useEffect, useState } from "react";
import { TokenType } from "../../../hooks/v3/types";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { Checkbox, RadioInput, TextField, TokenField, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { usePoolStore } from "~~/hooks/v3";

// TODO: figure out how to hold onto state for this component
// it currently resets when moving between pool configuration tabs
export function ChooseToken({ index }: { index: number }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [tokenWeight, setTokenWeight] = useState<number>(50);
  const { balance } = useReadToken(token?.address);

  const { tokens, setTokenConfigs } = usePoolStore();
  const { data } = useFetchTokenList();
  const tokenOptions = data || [];

  const handleTokenSelection = (selectedToken: Token) => {
    setToken(selectedToken);
    const updatedPoolTokens = [...tokens];
    const selectedTokenConfig = updatedPoolTokens[index];
    selectedTokenConfig.address = selectedToken.address;
    selectedTokenConfig.symbol = selectedToken.symbol;
    selectedTokenConfig.logoURI = selectedToken.logoURI;
    selectedTokenConfig.tokenType = TokenType.STANDARD;
    selectedTokenConfig.rateProvider = zeroAddress;
    selectedTokenConfig.paysYieldFees = false;
    updatedPoolTokens[index] = selectedTokenConfig;
    setTokenConfigs(updatedPoolTokens);
  };

  const handleTokenType = (tokenType: TokenType) => {
    const updatedPoolTokens = [...tokens];
    updatedPoolTokens[index].tokenType = tokenType;
    setTokenConfigs(updatedPoolTokens);
  };

  const handleRateProvider = (rateProvider: string) => {
    const updatedPoolTokens = [...tokens];
    updatedPoolTokens[index].rateProvider = rateProvider;
    setTokenConfigs(updatedPoolTokens);
  };

  const handlePaysYieldFees = () => {
    const updatedPoolTokens = [...tokens];
    updatedPoolTokens[index].paysYieldFees = !updatedPoolTokens[index].paysYieldFees;
    setTokenConfigs(updatedPoolTokens);
  };

  // When user changes one of the token weights, update the others to sum to 100
  useEffect(() => {
    const newWeight = tokenWeight;
    const remainingWeight = 100 - newWeight;
    const remainingTokens = tokens.length - 1;
    const evenWeight = remainingWeight / remainingTokens;

    const updatedPoolTokens = tokens.map((token, i) => {
      if (i === index) {
        return { ...token, weight: parseUnits(newWeight.toString(), 16) };
      } else {
        return { ...token, weight: parseUnits(evenWeight.toString(), 16) };
      }
    });

    setTokenConfigs(updatedPoolTokens);
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
            value={Number(formatUnits(tokens[index].weight, 16)).toFixed(0)}
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
            selectedToken={token}
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
            checked={tokens[index].tokenType === TokenType.STANDARD}
            onChange={() => handleTokenType(TokenType.STANDARD)}
          />
          <RadioInput
            name={`token-type-${index}`}
            label="With Rate"
            checked={tokens[index].tokenType === TokenType.WITH_RATE}
            onChange={() => handleTokenType(TokenType.WITH_RATE)}
          />
        </div>
      </div>
      {tokens[index].tokenType === TokenType.WITH_RATE && (
        <div className="flex items-end gap-3">
          <div className="flex-grow mt-2">
            <TextField
              label="Rate Provider"
              placeholder="Enter rate provider address"
              value={tokens[index].rateProvider !== zeroAddress ? tokens[index].rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
          </div>
          <Checkbox label="Pays Yield Fees" checked={tokens[index].paysYieldFees} onChange={handlePaysYieldFees} />
        </div>
      )}

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={handleTokenSelection} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
