"use client";

import { useCallback, useEffect } from "react";
import Link from "next/link";
import { ManagePoolCreation } from "./_components";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { Alert } from "~~/components/common";
import { TextField, TokenField } from "~~/components/common/";
import { useLocalStorage } from "~~/hooks/common";
import { useCheckIfPoolExists } from "~~/hooks/cow";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { type Token, useFetchTokenList } from "~~/hooks/token";

type TokenWithAmount = Token & { amount: string };

type CreatePoolFormData = {
  token1: TokenWithAmount;
  token2: TokenWithAmount;
  name: string;
  symbol: string;
  hasAgreedToWarning: boolean;
  isChangeNameDisabled: boolean;
  isChangeTokensDisabled: boolean;
};

const INITIAL_FORM_DATA: CreatePoolFormData = {
  token1: { amount: "" },
  token2: { amount: "" },
  name: "",
  symbol: "",
  hasAgreedToWarning: false,
  isChangeNameDisabled: false,
  isChangeTokensDisabled: false,
};

const CowAmm: NextPage = () => {
  const { targetNetwork } = useTargetNetwork();

  const [formData, setFormData] = useLocalStorage<CreatePoolFormData>(
    `createPoolFormData-${targetNetwork.id}`,
    INITIAL_FORM_DATA,
  );

  const [previousNetworkId, setPreviousNetworkId] = useLocalStorage<string | null>(
    "previousNetworkId",
    targetNetwork.id.toString(),
  );

  const { token1, token2, name, symbol, hasAgreedToWarning, isChangeNameDisabled, isChangeTokensDisabled } = formData;

  const { data: tokenList } = useFetchTokenList();
  const { existingPool } = useCheckIfPoolExists(token1?.address, token2?.address);

  const resetForm = () => {
    localStorage.removeItem(`createPoolFormData-${targetNetwork.id}`);
    setFormData(INITIAL_FORM_DATA);
  };

  const handleTokenChange = (tokenKey: "token1" | "token2", tokenData: Token) => {
    setFormData(prev => ({
      ...prev,
      [tokenKey]: {
        ...prev[tokenKey],
        ...tokenData,
        amount: prev[tokenKey].amount,
      },
    }));
  };

  const handleAmountChange = (tokenKey: "token1" | "token2", amount: string) => {
    setFormData(prev => ({
      ...prev,
      [tokenKey]: {
        ...prev[tokenKey],
        amount: amount,
      },
    }));
  };

  const handleInputChange = (field: keyof Omit<CreatePoolFormData, "token1" | "token2">, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleHasAgreedToWarning = () => {
    setFormData(prev => ({
      ...prev,
      hasAgreedToWarning: !prev.hasAgreedToWarning,
    }));
  };

  const handleSetIsChangeNameDisabled = useCallback(
    (isDisabled: boolean) => {
      setFormData(prev => ({
        ...prev,
        isChangeNameDisabled: isDisabled,
      }));
    },
    [setFormData],
  );
  const handleSetIsChangeTokensDisabled = useCallback(
    (isDisabled: boolean) => {
      setFormData(prev => ({
        ...prev,
        isChangeTokensDisabled: isDisabled,
      }));
    },
    [setFormData],
  );

  useEffect(() => {
    if (token1?.symbol && token2?.symbol) {
      const newName = `Balancer CoW AMM 50 ${token1?.symbol} 50 ${token2?.symbol}`;
      const newSymbol = `BCoW-50${token1?.symbol}-50${token2?.symbol}`;

      setFormData(prev => ({
        ...prev,
        name: newName,
        symbol: newSymbol,
      }));
    }
  }, [token1, token2, setFormData]);

  useEffect(() => {
    if (previousNetworkId !== targetNetwork.id.toString()) {
      resetForm();
    }
    setPreviousNetworkId(targetNetwork.id.toString());
  }, [targetNetwork.id, setPreviousNetworkId, previousNetworkId, resetForm]);

  // Filter out tokens that have already been chosen
  const selectableTokens = tokenList?.filter(
    token => token.address !== token1.address && token.address !== token2.address,
  );

  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 gap-7">
          <h1 className="text-2xl md:text-4xl font-bold">Create a CoW AMM Pool</h1>

          <div className="bg-base-200 p-7 rounded-xl w-full sm:w-[555px] flex flex-grow">
            <div className="flex flex-col items-center gap-4 w-full">
              <h5 className="text-xl md:text-2xl font-bold">Configure your pool</h5>

              <div className="w-full">
                <div className="ml-1 mb-1">Select pool tokens:</div>
                <div className="w-full flex flex-col gap-3">
                  <TokenField
                    value={token1.amount}
                    selectedToken={token1}
                    setToken={token => handleTokenChange("token1", token)}
                    tokenOptions={selectableTokens}
                    handleAmountChange={e => handleAmountChange("token1", e.target.value)}
                    isDisabled={isChangeTokensDisabled}
                  />
                  <TokenField
                    value={token2.amount}
                    selectedToken={token2}
                    setToken={token => handleTokenChange("token2", token)}
                    tokenOptions={selectableTokens}
                    handleAmountChange={e => handleAmountChange("token2", e.target.value)}
                    isDisabled={isChangeTokensDisabled}
                  />
                </div>
              </div>

              <TextField
                label="Pool name:"
                placeholder="i.e. Balancer CoW AMM 50 BAL 50 DAI"
                value={formData.name}
                onChange={e => handleInputChange("name", e.target.value)}
                isDisabled={isChangeNameDisabled}
              />
              <TextField
                label="Pool symbol:"
                placeholder="i.e. BCoW-50BAL-50DAI"
                value={formData.symbol}
                onChange={e => handleInputChange("symbol", e.target.value)}
                isDisabled={isChangeNameDisabled}
              />
            </div>
          </div>

          {existingPool ? (
            <Alert type="error">
              A CoW AMM pool with the selected tokens already exists. To add liquidity, go to the{" "}
              <Link
                className="link"
                rel="noopener noreferrer"
                target="_blank"
                href={`https://balancer.fi/pools/${existingPool.chain.toLowerCase()}/cow/${existingPool.address}`}
              >
                Balancer app
              </Link>
            </Alert>
          ) : (
            <Alert type="warning">
              <div className="form-control">
                <label className="label cursor-pointer flex gap-4 m-0 p-0">
                  <input
                    type="checkbox"
                    className="checkbox rounded-lg"
                    onChange={handleHasAgreedToWarning}
                    checked={hasAgreedToWarning}
                  />
                  <span className="">
                    I understand that assets must be added proportionally, or I risk loss of funds via arbitrage.
                  </span>
                </label>
              </div>
            </Alert>
          )}

          <ManagePoolCreation
            name={name}
            symbol={symbol}
            token1={{ rawAmount: parseUnits(token1.amount, token1?.decimals ?? 0), address: token1?.address }}
            token2={{ rawAmount: parseUnits(token2.amount, token2?.decimals ?? 0), address: token2?.address }}
            hasAgreedToWarning={hasAgreedToWarning}
            existingPool={existingPool}
            setIsChangeNameDisabled={handleSetIsChangeNameDisabled}
            setIsChangeTokensDisabled={handleSetIsChangeTokensDisabled}
            resetForm={resetForm}
          />
        </div>
      </div>
    </div>
  );
};

export default CowAmm;
