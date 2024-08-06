"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TokenImage, TokenSelectModal } from "~~/components/common";
import { type Token } from "~~/hooks/token";
import { useFetchTokenPrices, useReadToken } from "~~/hooks/token";
import { formatToHuman } from "~~/utils/formatToHuman";

export const TokenField = ({
  value,
  tokenOptions,
  setToken,
  selectedToken,
  handleAmountChange,
  isDisabled,
}: {
  isDisabled?: boolean;
  value: string;
  tokenOptions?: Token[] | undefined;
  setToken: (token: Token) => void;
  selectedToken: Token | null;
  handleAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { balance } = useReadToken(selectedToken?.address);
  const { data: tokenPrices, isLoading, isError } = useFetchTokenPrices();

  let price;
  if (tokenPrices && selectedToken?.address) {
    price = tokenPrices.find(
      token => selectedToken.address && token?.address.toLowerCase() === selectedToken?.address.toLowerCase(),
    )?.price;
  }
  if (price && price > 0) {
    price = (price * Number(value)).toFixed(2);
  } else {
    price = 0;
  }

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
          className={`pb-5 text-right text-2xl w-full input  rounded-xl bg-base-300 disabled:bg-base-300 disabled:text-base-content h-[77px]`}
        />
        <div className="absolute top-0 left-0 ">
          <div className="p-2.5">
            <button
              disabled={isDisabled}
              onClick={() => setIsModalOpen(true)}
              className="px-3 py-2 bg-secondary shadow-md disabled:text-base-content text-lg font-bold disabled:bg-base-100 rounded-lg flex justify-between items-center gap-2 mb-[1.5px]"
            >
              {selectedToken?.symbol && selectedToken.logoURI !== "" && <TokenImage token={selectedToken} />}
              {selectedToken?.symbol ? selectedToken.symbol : "Select Token"}{" "}
              {!isDisabled && <ChevronDownIcon className="w-4 h-4 mt-0.5" />}
            </button>

            {selectedToken && (
              <div className="ml-1 text-neutral-400 text-sm flex gap-5 ">
                <div>Balance: {formatToHuman(balance, selectedToken?.decimals || 0)}</div>
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-2 right-5 text-neutral-400">
          {isLoading ? <div>...</div> : isError ? <div>pricing error</div> : <div>${price}</div>}
        </div>
      </div>
      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
