"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { type Token } from "~~/app/cow/_components/ManageTokens";
import { TokenSelectModal } from "~~/components/common";
import { formatToHuman } from "~~/utils/formatToHuman";

export const TokenField = ({
  tokenOptions,
  setToken,
  selectedToken,
  balance,
}: {
  balance: bigint;
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  selectedToken: Token | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="relative w-full">
        <input
          type="number"
          // onChange={e => onAmountChange(e.target.value)}
          placeholder="0.0"
          className={`text-right text-2xl w-full input input-bordered rounded-xl bg-base-200 p-5 h-24`}
        />
        <div className="absolute top-0 left-0 ">
          <div className="flex-col p-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn bg-base-100 hover:bg-base-100 rounded-lg flex justify-between text-lg mb-1.5"
            >
              {selectedToken ? selectedToken.symbol : "Select Token"} <ChevronDownIcon className="w-4 h-4 mt-0.5" />
            </button>
            <div className="ml-1 text-neutral-400 text-sm">
              Balance: {formatToHuman(balance, selectedToken?.decimals || 0)}
            </div>
          </div>
        </div>
      </div>
      {isModalOpen && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
