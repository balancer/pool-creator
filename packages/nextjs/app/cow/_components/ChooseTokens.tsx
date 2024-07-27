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
  const { targetNetwork } = useTargetNetwork();
  const TOKENS = tokenList.tokens.filter(t => t.chainId === targetNetwork.id);

  const [selectableTokens] = useState<Token[]>(TOKENS);
  const [token1, setToken1] = useState<Address | undefined>();
  const [token2, setToken2] = useState<Address | undefined>();

  // const handleSetToken = (e, setToken) => {
  //     setToken(e.target.value);
  // }

  console.log("token1", token1);
  console.log("token2", token2);

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <ScaffoldAddress address={address} />
      <TokenSelect setToken={setToken1} tokenOptions={selectableTokens} />
      <TokenSelect setToken={setToken2} tokenOptions={selectableTokens} />
    </div>
  );
};
