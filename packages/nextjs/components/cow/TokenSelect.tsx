"use client";

import { Dispatch, SetStateAction } from "react";
import { type Token } from "./Pool";

export const TokenSelect = ({
  tokenOptions,
  setToken,
}: {
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<string | undefined>>;
}) => {
  return (
    <select onChange={e => setToken(e.target.value)} className="select select-bordered w-full max-w-xs">
      <option disabled selected>
        Select Token
      </option>
      {tokenOptions.map(token => (
        <option key={token.address} value={token.address}>
          {token.symbol}
        </option>
      ))}
    </select>
  );
};
