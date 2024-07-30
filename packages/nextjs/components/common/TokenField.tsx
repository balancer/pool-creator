"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { type Token } from "~~/app/cow/_components/InitializePool";
import { TokenSelectModal } from "~~/components/common";
import { formatToHuman } from "~~/utils/formatToHuman";

export const TokenField = ({
  tokenOptions,
  setToken,
  selectedToken,
  balance,
  allowance,
  handleAmountChange,
}: {
  balance: bigint;
  allowance: bigint;
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  selectedToken: Token | undefined;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative w-full">
        <input
          type="number"
          onChange={handleAmountChange}
          min="0"
          placeholder="0.0"
          className={`text-right text-2xl w-full input input-bordered rounded-xl bg-base-200 p-5 h-24`}
        />
        <div className="absolute top-0 left-0 ">
          <div className="flex-col p-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="p-3 font-bold bg-base-100 rounded-lg flex justify-between items-center gap-3 text-lg mb-1"
            >
              {selectedToken ? selectedToken.symbol : "Select Token"} <ChevronDownIcon className="w-4 h-4 mt-0.5" />
            </button>
            {selectedToken && (
              <div className="ml-1 text-neutral-400 text-sm flex gap-5">
                <div>Balance: {formatToHuman(balance, selectedToken?.decimals || 0)}</div>
                <div>Allowance: {formatToHuman(allowance, selectedToken?.decimals || 0)}</div>
              </div>
            )}
          </div>
        </div>
      </div>
      {isModalOpen && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
