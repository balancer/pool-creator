"use client";

import { formatUnits, parseUnits } from "viem";
import { ExclamationTriangleIcon, WalletIcon } from "@heroicons/react/24/outline";
import { TokenImage } from "~~/components/common";
import { type Token } from "~~/hooks/token";
import { COW_MIN_AMOUNT } from "~~/utils";

interface TokenFieldProps {
  inputValue: string;
  usdValue: number | null | undefined;
  isUsdValueLoading: boolean;
  isUsdValueError: boolean;
  balance?: bigint;
  selectedToken: Token | null;
  sufficientAmount?: boolean;
  isDisabled?: boolean;
  setAmountToUserBalance?: () => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const TokenAmountField: React.FC<TokenFieldProps> = ({
  inputValue,
  usdValue,
  isUsdValueLoading,
  isUsdValueError,
  balance,
  selectedToken,
  sufficientAmount,
  isDisabled,
  onChange,
  setAmountToUserBalance,
}) => {
  const amountGreaterThanBalance =
    balance !== undefined && parseUnits(inputValue ?? "0", selectedToken?.decimals || 0) > balance;

  return (
    <>
      <div className="relative w-full rounded-lg">
        <input
          disabled={isDisabled}
          type="number"
          onChange={onChange}
          min="0"
          placeholder="0.0"
          value={inputValue}
          className={`shadow-inner border-0 h-[77px] pb-4 px-4 text-right text-2xl w-full input rounded-xl bg-base-300 disabled:bg-base-300 disabled:text-base-content 
            ${
              sufficientAmount !== undefined && (amountGreaterThanBalance || !sufficientAmount) && "ring-1 ring-red-400"
            } `}
        />
        <div className="absolute top-0 left-0 ">
          <div className="p-2.5">
            <div
              className={
                "bg-base-100 px-3 py-1.5 shadow-md disabled:text-base-content text-lg font-bold rounded-lg flex justify-between items-center gap-2 w-fit"
              }
            >
              {selectedToken && <TokenImage size="sm" token={selectedToken} />}
              {selectedToken?.symbol}
            </div>

            {selectedToken && balance !== undefined && (
              <div className={`flex items-center gap-2 text-neutral-400`}>
                <div
                  onClick={setAmountToUserBalance}
                  className="flex items-center gap-1 hover:text-accent hover:cursor-pointer"
                >
                  <WalletIcon className="h-4 w-4 mt-0.5" /> {formatUnits(balance, selectedToken?.decimals || 0)}
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
            )}
          </div>
        </div>
        <div className="absolute bottom-1 right-5 text-neutral-400">
          {typeof usdValue === "number" ? (
            isUsdValueLoading ? (
              <div>...</div>
            ) : isUsdValueError ? (
              <div>price error</div>
            ) : (
              <div>${usdValue.toFixed(2)}</div>
            )
          ) : !isUsdValueLoading && selectedToken && inputValue ? (
            <div>unknown price</div>
          ) : null}
        </div>
      </div>
    </>
  );
};
