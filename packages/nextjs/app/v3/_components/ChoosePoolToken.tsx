import React, { useState } from "react";
import { TokenConfig, TokenType } from "../types";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { TokenField, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";

export function ChoosePoolToken({
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
  const [tokenType, setTokenType] = useState<TokenType>(TokenType.STANDARD);
  const [tokenWeight, setTokenWeight] = useState<number>(50);
  const { balance } = useReadToken(token?.address);

  const { data } = useFetchTokenList();
  const tokenOptions = data || [];

  const handleTokenSelection = (selectedToken: Token) => {
    setToken(selectedToken);
    const updatedPoolTokens = [...poolTokens];
    updatedPoolTokens[index] = {
      address: selectedToken.address,
      rateProvider: zeroAddress,
      paysYieldFees: false,
      tokenType: TokenType.STANDARD,
      weight: parseUnits(tokenWeight.toString(), 16),
      symbol: selectedToken.symbol,
      logoURI: selectedToken.logoURI,
    };
    setPoolTokens(updatedPoolTokens);
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Math.min(Math.max(Number(e.target.value), 1), 99);
    setTokenWeight(newWeight);

    const updatedPoolTokens = [...poolTokens];
    updatedPoolTokens[index].weight = parseUnits(newWeight.toString(), 16);
    console.log("updatedPoolTokens", updatedPoolTokens);

    // Calculate the other index and update its weight
    const otherIndex = index === 0 ? 1 : 0;
    updatedPoolTokens[otherIndex].weight = parseUnits((100 - newWeight).toString(), 16);

    setPoolTokens(updatedPoolTokens);
  };

  return (
    <div className="flex">
      <div className="flex gap-3 w-full">
        <div className="relative w-full max-w-[80px]">
          <input
            type="number"
            min={1}
            max={99}
            value={formatUnits(poolTokens[index].weight, 16)}
            onChange={e => handleWeightChange(e)}
            placeholder="99"
            className="input text-2xl shadow-inner bg-base-300 rounded-xl h-full w-full"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">%</span>
        </div>
        <div className="flex-grow">
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
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={tokenType === TokenType.STANDARD}
                onChange={() => setTokenType(TokenType.STANDARD)}
                className="checkbox mr-2 rounded-md text-xl"
              />
              <span className="label-text">Standard</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={tokenType === TokenType.WITH_RATE}
                onChange={() => setTokenType(TokenType.WITH_RATE)}
                className="checkbox mr-2 rounded-md"
              />
              <span className="label-text">With Rate</span>
            </label>
          </div>
        </div>
      </div>

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={handleTokenSelection} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
