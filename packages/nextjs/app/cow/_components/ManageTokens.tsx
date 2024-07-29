"use client";

import { useState } from "react";
import { type Address } from "viem";
import { TokenField } from "~~/components/common/";
import { useToken } from "~~/hooks/cow";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import tokenList from "~~/utils/balancer/tokenlist.json";

export type Token = {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
};

/**
 *  Fetch user balance for each selected token
 *
 *  Convert input to wrap around token select button
 *  Show user balance for the selected token under the select button
 *
 *  Approve each selected token ( with button under each token select/amount input?)
 *  Bind each selected token ( with button under each token select/amount input?)
 */
export const ManageTokens = ({ address }: { address: Address }) => {
  const [token1, setToken1] = useState<Token | undefined>();
  const [token2, setToken2] = useState<Token | undefined>();

  const { targetNetwork } = useTargetNetwork();
  const { tokenBalance: balance1 } = useToken(token1?.address, address);
  const { tokenBalance: balance2 } = useToken(token2?.address, address);

  const allTokens = tokenList.tokens.filter(t => t.chainId === targetNetwork.id);
  const selectableTokens = allTokens.filter(token => token !== token1 && token !== token2);

  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h5 className="text-2xl font-bold">Approve Tokens</h5>

      <div className="text-xl">Select 2 tokens and approve the pool to spend</div>

      <div className="w-full flex flex-col gap-4">
        <TokenField balance={balance1} selectedToken={token1} setToken={setToken1} tokenOptions={selectableTokens} />
        <button className="btn btn-accent text-base-300 text-lg w-full rounded-xl">Approve</button>
      </div>

      <div className="w-full flex flex-col gap-4">
        <TokenField balance={balance2} selectedToken={token2} setToken={setToken2} tokenOptions={selectableTokens} />
        <button className="btn btn-accent text-base-300 text-lg w-full rounded-xl">Approve</button>
      </div>
    </div>
  );
};
