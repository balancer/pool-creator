"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { WalletIcon } from "@heroicons/react/24/outline";
import { TokenImage, TokenSelectModal } from "~~/components/common";
import { type Token } from "~~/hooks/token";
import { useFetchTokenPrices, useReadToken } from "~~/hooks/token";
import { COW_MIN_AMOUNT, formatToHuman } from "~~/utils";

export const TokenField = ({
  value,
  tokenOptions,
  setToken,
  selectedToken,
  handleAmountChange,
  isDisabled,
  sufficientAmount,
}: {
  sufficientAmount?: boolean;
  isDisabled?: boolean;
  value: string;
  tokenOptions?: Token[] | undefined;
  setToken: (token: Token) => void;
  selectedToken: Token | null;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tokenPrices, isLoading, isError } = useFetchTokenPrices();
  const { balance } = useReadToken(selectedToken?.address);

  let price = 0;
  if (tokenPrices && selectedToken?.address) {
    price = tokenPrices.find(token => token.address.toLowerCase() === selectedToken?.address.toLowerCase())?.price ?? 0;
  }
  if (price > 0) price = price * Number(value);

  const amountGreaterThanBalance = parseUnits(value, selectedToken?.decimals || 0) > balance;

  return (
    <>
      <div className="relative w-full">
        <input
          disabled={isDisabled}
          type="number"
          onChange={handleAmountChange}
          min="0"
          placeholder="0.0"
          value={value}
          className={`pb-5 text-right text-2xl w-full input  rounded-xl bg-base-300 disabled:bg-base-300 disabled:text-base-content h-[77px] ${sufficientAmount !== undefined && (amountGreaterThanBalance || !sufficientAmount) ? "ring-1 ring-red-400" : ""}`}
        />
        <div className="absolute top-0 left-0 ">
          <div className="p-2.5">
            <button
              disabled={isDisabled}
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-1.5 bg-secondary shadow-md disabled:text-base-content text-lg font-bold disabled:bg-base-100 rounded-lg flex justify-between items-center gap-2 mb-[1px]"
            >
              {selectedToken && selectedToken.logoURI !== "" && <TokenImage token={selectedToken} />}
              {selectedToken?.symbol ? selectedToken.symbol : "Select Token"}{" "}
              {!isDisabled && <ChevronDownIcon className="w-4 h-4 mt-0.5" />}
            </button>

            {selectedToken && (
              <div
                className={`text-neutral-400 flex items-center gap-1 ${amountGreaterThanBalance ? "text-red-400" : ""}`}
              >
                <WalletIcon className="h-4 w-4 mt-0.5" /> {formatToHuman(balance, selectedToken?.decimals || 0)}
                {amountGreaterThanBalance && <div>Insufficient balance</div>}
                {sufficientAmount !== undefined && !sufficientAmount && (
                  <div className="ml-1 text-red-400 flex items-center gap-1">
                    <ExclamationTriangleIcon className="w-4 h-4" />
                    Minimum amount is {formatUnits(COW_MIN_AMOUNT, selectedToken.decimals)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-2 right-5 text-neutral-400">
          {isLoading ? <div>...</div> : isError ? <div>price error</div> : <div>${price.toFixed(2)}</div>}
        </div>
      </div>
      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
