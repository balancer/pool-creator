"use client";

import { useState } from "react";
import { CreatePool } from "./_components";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { TokenField } from "~~/components/common/";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";

const CoW: NextPage = () => {
  const [token1, setToken1] = useState<Token>();
  const [token2, setToken2] = useState<Token>();
  const [amountToken1, setAmountToken1] = useState("");
  const [amountToken2, setAmountToken2] = useState("");
  const [poolName, setPoolName] = useState("");
  const [poolSymbol, setPoolSymbol] = useState("");

  const rawAmount1 = parseUnits(amountToken1, token1?.decimals ?? 0);
  const rawAmount2 = parseUnits(amountToken2, token2?.decimals ?? 0);

  const { balance: balance1 } = useReadToken(token1?.address);
  const { balance: balance2 } = useReadToken(token2?.address);
  const { data: tokenList } = useFetchTokenList();

  // Filter out tokens that are already selected
  const selectableTokens = tokenList?.filter(token => token !== token1 && token !== token2);

  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 gap-7">
          <h1 className="text-4xl font-bold">Create a CoW AMM Pool</h1>

          <div className="bg-base-200 p-7 rounded-xl w-[555px] flex flex-grow">
            <div className="flex flex-col items-center gap-5 w-full">
              <div>
                <h5 className="text-2xl font-bold">Configure your pool</h5>
              </div>

              <div className="w-full flex flex-col gap-3">
                <div className="text-lg ml-2">Select pool tokens:</div>
                <TokenField
                  balance={balance1}
                  selectedToken={token1}
                  setToken={setToken1}
                  tokenOptions={selectableTokens}
                  handleAmountChange={e => setAmountToken1(e.target.value)}
                />
                <TokenField
                  balance={balance2}
                  selectedToken={token2}
                  setToken={setToken2}
                  tokenOptions={selectableTokens}
                  handleAmountChange={e => setAmountToken2(e.target.value)}
                />
              </div>
              <div className="w-full">
                <div className="text-lg ml-2">Pool name:</div>
                <input
                  type="text"
                  placeholder="Enter pool name"
                  onChange={e => setPoolName(e.target.value)}
                  className="w-full input input-bordered rounded-xl bg-base-200 p-5 h-16"
                />
              </div>
              <div className="w-full">
                <div className="text-lg ml-2">Pool symbol:</div>
                <input
                  type="text"
                  placeholder="Enter pool symbol"
                  onChange={e => setPoolSymbol(e.target.value)}
                  className="w-full input input-bordered rounded-xl bg-base-200 p-5 h-16"
                />
              </div>
            </div>
          </div>

          <CreatePool
            name={poolName}
            symbol={poolSymbol}
            token1={{ rawAmount: rawAmount1, address: token1?.address }}
            token2={{ rawAmount: rawAmount2, address: token2?.address }}
          />
        </div>
      </div>
    </div>
  );
};

export default CoW;
