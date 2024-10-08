import React, { useEffect, useState } from "react";
import { TokenConfig, TokenType } from "../types";
import { formatUnits, parseUnits, zeroAddress } from "viem";
import { TokenField, TokenSelectModal } from "~~/components/common";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";

// TODO: figure out how to hold onto state for this component
// it currently resets when moving between pool configuration tabs
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
            <span className="label-text">Weight</span>
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
            <span className="label-text">Token</span>
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
            <span className="label-text">Type</span>
          </label>
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={poolTokens[index].tokenType === TokenType.STANDARD}
                onChange={() => handleTokenType(TokenType.STANDARD)}
                className="checkbox mr-2 rounded-md text-xl"
              />
              <span className="label-text">Standard</span>
            </label>
          </div>
          <div className="form-control">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={poolTokens[index].tokenType === TokenType.WITH_RATE}
                onChange={() => handleTokenType(TokenType.WITH_RATE)}
                className="checkbox mr-2 rounded-md"
              />
              <span className="label-text">With Rate</span>
            </label>
          </div>
        </div>
      </div>
      {poolTokens[index].tokenType === TokenType.WITH_RATE && (
        <div className="flex items-end gap-3">
          <div className="flex flex-col flex-grow">
            <label className="label">
              <span className="label-text">Rate Provider</span>
            </label>
            <input
              type="text"
              placeholder="Enter rate provider address"
              className="bg-base-300 rounded-xl shadow-inner border-0 text-lg input flex-grow"
              value={poolTokens[index].rateProvider !== zeroAddress ? poolTokens[index].rateProvider : ""}
              onChange={e => handleRateProvider(e.target.value)}
            />
          </div>
          <div className="form-control mb-1">
            <label className="label cursor-pointer">
              <input
                type="checkbox"
                checked={poolTokens[index].paysYieldFees}
                onChange={handlePaysYieldFees}
                className="checkbox mr-2 rounded-md"
              />
              <span className="label-text">Pays Yield Fees</span>
            </label>
          </div>
        </div>
      )}

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={handleTokenSelection} setIsModalOpen={setIsModalOpen} />
      )}
    </div>
  );
}
