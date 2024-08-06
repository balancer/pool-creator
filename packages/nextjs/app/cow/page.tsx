"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PoolCreation } from "./_components";
import type { NextPage } from "next";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { PoolConfiguration } from "~~/app/cow/_components/PoolConfiguration";
import { Alert, TransactionButton } from "~~/components/common";
import { TextField, TokenField } from "~~/components/common/";
import { useCheckIfPoolExists } from "~~/hooks/cow";
import { usePoolCreationPersistedState } from "~~/hooks/cow/usePoolCreationState";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { type Token, useFetchTokenList } from "~~/hooks/token";

const CowAmm: NextPage = () => {
  const { targetNetwork } = useTargetNetwork();
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");
  const [hasAgreedToWarning, setAgreedToWarning] = useState<boolean>(false);
  const [poolName, setPoolName] = useState<string>("");
  const [poolSymbol, setPoolSymbol] = useState<string>("");
  const persistedState = usePoolCreationPersistedState(state => state.state);
  const clearPersistedState = usePoolCreationPersistedState(state => state.clearPersistedState);

  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const { existingPool } = useCheckIfPoolExists(token1?.address, token2?.address);

  const { chain } = useAccount();

  useEffect(() => {
    console.log(poolSymbol);
    if (typeof chain?.id === "number") {
      setToken1(null);
      setToken2(null);
      setToken1Amount("");
      setToken2Amount("");
      setAgreedToWarning(false);
      setPoolName("");
      setPoolSymbol("");
    }
  }, [chain?.id]);

  // Autofill pool name and symbol based on selected tokens
  useEffect(() => {
    if (token1 !== null && token2 !== null) {
      setPoolName(`Balancer CoW AMM 50 ${token1.symbol} 50 ${token2.symbol}`);
      setPoolSymbol(`BCoW-50${token1.symbol}-50${token2.symbol}`);
    } else {
      setPoolName("");
      setPoolSymbol("");
    }
  }, [token1, token2]);

  return (
    <div className="flex-grow bg-base-300">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center flex-col flex-grow py-10 px-5 lg:px-10 gap-7">
          <h1 className="text-2xl md:text-4xl font-bold">Create a CoW AMM Pool</h1>
          {!persistedState && <PoolConfiguration />}
          {persistedState && <PoolCreation state={persistedState} clearState={clearPersistedState} />}
        </div>
      </div>
    </div>
  );
};

export default CowAmm;
