"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ManagePoolCreation } from "./_components";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { Alert } from "~~/components/common";
import { TextField, TokenField } from "~~/components/common/";
import { useLocalStorage } from "~~/hooks/common";
import { useCheckIfPoolExists } from "~~/hooks/cow";
import { type Token, useFetchTokenList } from "~~/hooks/token";

const CowAmm: NextPage = () => {
  const [token1, setToken1] = useLocalStorage<Token | undefined>("token1", undefined);
  const [token2, setToken2] = useLocalStorage<Token | undefined>("token2", undefined);
  const [amountToken1, setAmountToken1] = useLocalStorage<string>("amountToken1", "");
  const [amountToken2, setAmountToken2] = useLocalStorage<string>("amountToken2", "");
  const [poolName, setPoolName] = useLocalStorage<string>("poolName", "");
  const [poolSymbol, setPoolSymbol] = useLocalStorage<string>("poolSymbol", "");
  const [hasAgreedToWarning, setHasAgreedToWarning] = useLocalStorage("hasAgreedToWarning", false);
  const [isFormDisabled, setIsFormDisabled] = useLocalStorage("isFormDisabled", false);

  const rawAmount1 = parseUnits(amountToken1, token1?.decimals ?? 0);
  const rawAmount2 = parseUnits(amountToken2, token2?.decimals ?? 0);

  const { data: tokenList } = useFetchTokenList();
  const { existingPool } = useCheckIfPoolExists(token1?.address, token2?.address);

  const resetForm = () => {
    setToken1(undefined);
    setToken2(undefined);
    setAmountToken1("");
    setAmountToken2("");
    setPoolName("");
    setPoolSymbol("");
    setHasAgreedToWarning(false);
    setIsFormDisabled(false);
  };

  useEffect(() => {
    if (token1 && token2) {
      setPoolName(`Balancer CoW AMM 50 ${token1?.symbol} 50 ${token2?.symbol}`);
      setPoolSymbol(`BCoW-50${token1?.symbol}-50${token2?.symbol}`);
    }
  }, [token1, token2, setPoolName, setPoolSymbol]);

  // Filter out tokens that have already been chosen
  const selectableTokens = tokenList?.filter(token => token !== token1 && token !== token2);

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
                    value={amountToken1}
                    selectedToken={token1}
                    setToken={setToken1}
                    tokenOptions={selectableTokens}
                    handleAmountChange={e => setAmountToken1(e.target.value)}
                    isDisabled={isFormDisabled}
                  />
                  <TokenField
                    value={amountToken2}
                    selectedToken={token2}
                    setToken={setToken2}
                    tokenOptions={selectableTokens}
                    handleAmountChange={e => setAmountToken2(e.target.value)}
                    isDisabled={isFormDisabled}
                  />
                </div>
              </div>

              <TextField
                label="Pool name:"
                placeholder="i.e. Balancer CoW AMM 50 BAL 50 DAI"
                value={poolName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolName(e.target.value)}
                isDisabled={isFormDisabled}
              />
              <TextField
                label="Pool symbol:"
                placeholder="i.e. BCoW-50BAL-50DAI"
                value={poolSymbol}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPoolSymbol(e.target.value)}
                isDisabled={isFormDisabled}
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
                    onChange={() => setHasAgreedToWarning(!hasAgreedToWarning)}
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
            name={poolName}
            symbol={poolSymbol}
            token1={{ rawAmount: rawAmount1, address: token1?.address }}
            token2={{ rawAmount: rawAmount2, address: token2?.address }}
            hasAgreedToWarning={hasAgreedToWarning}
            existingPool={existingPool}
            setIsFormDisabled={setIsFormDisabled}
            resetForm={resetForm}
          />
        </div>
      </div>
    </div>
  );
};

export default CowAmm;
