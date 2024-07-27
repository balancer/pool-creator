// "use client";
import { Dispatch, SetStateAction } from "react";
import { type Token } from "~~/app/cow/_components/ChooseTokens";

export const TokenSelect = ({
  tokenOptions,
  setToken,
}: {
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<string | undefined>>;
}) => {
  return (
    <select onChange={e => setToken(e.target.value)} className="select select-bordered w-full max-w-xs rounded-lg">
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
