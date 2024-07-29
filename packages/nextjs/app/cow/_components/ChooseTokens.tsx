"use client";

import { useState } from "react";
import { type Address } from "viem";
import { TokenSelect } from "~~/components/common/TokenSelect";
import { Address as ScaffoldAddress } from "~~/components/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import tokenList from "~~/utils/balancer/tokenlist.json";

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
};

/**
 *  Amount input for each selected token
 *  Fetch user balance for each selected token
 *  Approve each selected token
 *  Bind each selected token
 */
export const ChooseTokens = ({ address }: { address: Address }) => {
  const [token1, setToken1] = useState<Token | undefined>();
  const [token2, setToken2] = useState<Token | undefined>();

  const { targetNetwork } = useTargetNetwork();

  const allTokens = tokenList.tokens.filter(t => t.chainId === targetNetwork.id);
  const selectableTokens = allTokens.filter(token => token !== token1 && token !== token2);

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <h5 className="text-2xl font-bold">Approve Tokens</h5>

      <p className="text-xl">
        The second step is to select two tokens and approve the pool to spend an amount of each token
      </p>

      <TokenSelect selectedToken={token1} setToken={setToken1} tokenOptions={selectableTokens} />
      <TokenSelect selectedToken={token2} setToken={setToken2} tokenOptions={selectableTokens} />

      <ScaffoldAddress size="xl" address={address} />
    </div>
  );
};
