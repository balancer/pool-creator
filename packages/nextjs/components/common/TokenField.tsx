"use client";

import { useState } from "react";
import { formatUnits, parseUnits } from "viem";
import { ChevronDownIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { WalletIcon } from "@heroicons/react/24/outline";
import { TokenImage, TokenSelectModal } from "~~/components/common";
import { type Token } from "~~/hooks/token";
import { useFetchTokenPrices } from "~~/hooks/token";
import { COW_MIN_AMOUNT, formatToHuman } from "~~/utils";

interface TokenFieldProps {
  value: string;
  balance?: bigint;
  selectedToken: Token | null;
  sufficientAmount?: boolean;
  isDisabled?: boolean;
  tokenOptions?: Token[];
  setToken?: (token: Token) => void;
  setTokenAmount?: (amount: string) => void;
  tokenWeight: string;
}

export const TokenField: React.FC<TokenFieldProps> = ({
  value,
  balance,
  selectedToken,
  sufficientAmount,
  isDisabled,
  tokenOptions,
  setToken,
  setTokenAmount,
  tokenWeight,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: tokenPrices, isLoading, isError } = useFetchTokenPrices();

  let price = 0;
  if (tokenPrices && selectedToken?.address) {
    price = tokenPrices.find(token => token.address.toLowerCase() === selectedToken?.address.toLowerCase())?.price ?? 0;
  }
  if (price > 0) price = price * Number(value);

  const amountGreaterThanBalance = balance !== undefined && parseUnits(value, selectedToken?.decimals || 0) > balance;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!setTokenAmount) return;
    const inputValue = e.target.value.trim();
    if (Number(inputValue) >= 0) {
      setTokenAmount(inputValue);
    } else {
      setTokenAmount("");
    }
  };

  const setAmountToMax = () =>
    setTokenAmount && setTokenAmount(formatUnits(balance || 0n, selectedToken?.decimals || 0));
  return (
    <>
      <div className="relative w-full rounded-xl">
        <input
          disabled={isDisabled}
          type="number"
          onChange={handleAmountChange}
          min="0"
          placeholder="0.0"
          value={value}
          className={`shadow-inner border-0 h-[77px] pb-4 px-4 text-right text-2xl w-full input rounded-xl bg-base-300 disabled:bg-base-300 disabled:text-base-content 
            ${
              sufficientAmount !== undefined && (amountGreaterThanBalance || !sufficientAmount) && "ring-1 ring-red-400"
            } `}
        />
        <div className="absolute top-0 left-0 ">
          <div className="p-2.5">
            <button
              disabled={isDisabled}
              onClick={() => setIsModalOpen(true)}
              className={`${
                selectedToken
                  ? "bg-base-100"
                  : "text-neutral-700 bg-gradient-to-b from-custom-beige-start to-custom-beige-end to-100%"
              } px-3 py-1.5 shadow-md disabled:text-base-content text-lg font-bold disabled:bg-base-100 rounded-lg flex justify-between items-center gap-2 mb-[1px]`}
            >
              {selectedToken && <TokenImage size="sm" token={selectedToken} />}
              {selectedToken?.symbol
                ? `${selectedToken.symbol} ${tokenWeight}%`
                : `Select ${tokenWeight !== "50" ? `${tokenWeight}% ` : ""}Token`}{" "}
              {!isDisabled && <ChevronDownIcon className="w-4 h-4 mt-0.5" />}
            </button>

            {selectedToken && balance !== undefined ? (
              <div className={`flex items-center gap-2 text-neutral-400`}>
                <div
                  onClick={setAmountToMax}
                  className="flex items-center gap-1 hover:text-accent hover:cursor-pointer"
                >
                  <WalletIcon className="h-4 w-4 mt-0.5" /> {formatToHuman(balance, selectedToken?.decimals || 0)}
                </div>
                {amountGreaterThanBalance && (
                  <div className="flex items-center gap-1 text-red-400">
                    <ExclamationTriangleIcon className="w-4 h-4 mt-0.5" /> Insufficient balance
                  </div>
                )}
                {sufficientAmount !== undefined && !sufficientAmount && (
                  <div className="flex items-center gap-1 text-red-400">
                    <ExclamationTriangleIcon className="w-4 h-4 mt-0.5" />
                    Minimum amount is {formatUnits(COW_MIN_AMOUNT, selectedToken.decimals)}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-neutral-400 ml-1">{selectedToken?.name}</div>
            )}
          </div>
        </div>
        {price !== 0 ? (
          <div className="absolute bottom-1 right-5 text-neutral-400">
            {isLoading ? <div>...</div> : isError ? <div>price error</div> : <div>${price.toFixed(2)}</div>}
          </div>
        ) : null}
      </div>
      {isModalOpen && tokenOptions && setToken && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
