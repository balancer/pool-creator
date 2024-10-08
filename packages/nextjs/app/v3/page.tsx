"use client";

import { useState } from "react";
import { PoolConfiguration, PoolSummary } from "./_components";
import { PoolType, TokenConfig, TokenType } from "./types";
import type { NextPage } from "next";
import { parseUnits, zeroAddress } from "viem";

export const initialTokenConfig: TokenConfig = {
  address: undefined,
  rateProvider: zeroAddress,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  weight: parseUnits("50", 16),
  symbol: undefined,
  logoURI: undefined,
};

/**
 * Keep all the pool creation state in this parent component
 * Feed details to PoolCreation & PoolSummary components
 */
const V3Pool: NextPage = () => {
  const [poolType, setPoolType] = useState<PoolType>();
  const [poolTokens, setPoolTokens] = useState<TokenConfig[]>([initialTokenConfig, initialTokenConfig]);
  const [poolName, setPoolName] = useState<string>("");
  const [poolSymbol, setPoolSymbol] = useState<string>("");
  return (
    <div className="flex justify-center">
      <div className="flex justify-center py-10 px-5 lg:px-10 w-full max-w-screen-2xl">
        <div className="flex flex-col justify-center gap-5 w-full">
          <h1 className="text-5xl font-bold mb-7 text-center">Balancer v3</h1>
          <div className="flex gap-5 w-full justify-center">
            <PoolConfiguration
              poolType={poolType}
              setPoolType={setPoolType}
              poolTokens={poolTokens}
              setPoolTokens={setPoolTokens}
              poolName={poolName}
              setPoolName={setPoolName}
              poolSymbol={poolSymbol}
              setPoolSymbol={setPoolSymbol}
            />
            <PoolSummary poolType={poolType} poolTokens={poolTokens} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default V3Pool;
