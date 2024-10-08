import React, { useEffect, useState } from "react";
import { TokenConfig, TokenType } from "../types";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { Checkbox, RadioInput, TextField, TokenField, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";

// TODO: figure out how to hold onto state for this component
// it currently resets when moving between pool configuration tabs
export function ChooseToken({
  poolTokens,
  setPoolTokens,
  index,
}: {
  poolTokens: TokenConfig[];
  setPoolTokens: (tokens: TokenConfig[]) => void;
  index: number;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState<Token | null>(null);
  const [tokenAmount, setTokenAmount] = useState<string>("");
  const [tokenWeight, setTokenWeight] = useState<number>(50);
  const { balance } = useReadToken(token?.address);

  const { data } = useFetchTokenList();
  const tokenOptions = data || [];

  const handleTokenSelection = (selectedToken: Token) => {
    setToken(selectedToken);
    const updatedPoolTokens = [...poolTokens];
    const selectedTokenConfig = updatedPoolTokens[index];
    selectedTokenConfig.address = selectedToken.address;
    selectedTokenConfig.symbol = selectedToken.symbol;
    selectedTokenConfig.logoURI = selectedToken.logoURI;
    selectedTokenConfig.tokenType = TokenType.STANDARD;
    selectedTokenConfig.rateProvider = zeroAddress;
    selectedTokenConfig.paysYieldFees = false;
    updatedPoolTokens[index] = selectedTokenConfig;
    setPoolTokens(updatedPoolTokens);
  };

  const handleTokenType = (tokenType: TokenType) => {
    const updatedPoolTokens = [...poolTokens];
    updatedPoolTokens[index].tokenType = tokenType;
    setPoolTokens(updatedPoolTokens);
  };

  const handleRateProvider = (rateProvider: string) => {
    const updatedPoolTokens = [...poolTokens];
    updatedPoolTokens[index].rateProvider = rateProvider;
    setPoolTokens(updatedPoolTokens);
  };

  const handlePaysYieldFees = () => {
    const updatedPoolTokens = [...poolTokens];
    updatedPoolTokens[index].paysYieldFees = !updatedPoolTokens[index].paysYieldFees;
    setPoolTokens(updatedPoolTokens);
  };

  // When user changes one of the token weights, update the others to sum to 100
  useEffect(() => {
    const newWeight = tokenWeight;
    const remainingWeight = 100 - newWeight;
    const remainingTokens = poolTokens.length - 1;
    const evenWeight = remainingWeight / remainingTokens;

    const updatedPoolTokens = poolTokens.map((token, i) => {
      if (i === index) {
        return { ...token, weight: parseUnits(newWeight.toString(), 16) };
      } else {
        return { ...token, weight: parseUnits(evenWeight.toString(), 16) };
      }
    });

    setPoolTokens(updatedPoolTokens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenWeight]);

  return (
    <div>
      <div className="flex gap-3 w-full">
        <div className="relative w-full max-w-[80px] flex flex-col">
          <label className="label">
            <span className="label-text text-lg">Weight</span>
          </label>
          <input
            type="number"
            min="0"
            max="99"
            value={Number(formatUnits(poolTokens[index].weight, 16)).toFixed(0)}
            onChange={e => setTokenWeight(Number(e.target.value))}
            className="input text-2xl shadow-inner bg-base-300 rounded-xl h-full w-full"
          />
          <span className="absolute right-3 top-20 -translate-y-1/2">%</span>
        </div>
        <div className="flex-grow">
          <label className="label">
            <span className="label-text text-lg">Token</span>
          </label>
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
          <label className="label">
            <span className="label-text text-lg">Type</span>
          </label>
          <RadioInput
            name={`token-type-${index}`}
            label="Standard"
            checked={poolTokens[index].tokenType === TokenType.STANDARD}
            onChange={() => handleTokenType(TokenType.STANDARD)}
          />
          <RadioInput
            name={`token-type-${index}`}
            label="With Rate"
            checked={poolTokens[index].tokenType === TokenType.WITH_RATE}
            onChange={() => handleTokenType(TokenType.WITH_RATE)}
          />
        </div>
      </div>
      {poolTokens[index].tokenType === TokenType.WITH_RATE && (
        <div className="flex items-end gap-3">
          <div className="flex-grow mt-2">
            <TextField
              label="Rate Provider"
              placeholder="Enter rate provider address"
              value={poolTokens[index].rateProvider !== zeroAddress ? poolTokens[index].rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
          </div>
          <Checkbox label="Pays Yield Fees" checked={poolTokens[index].paysYieldFees} onChange={handlePaysYieldFees} />
        </div>
      )}

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={handleTokenSelection} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
