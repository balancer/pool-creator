"use client";

import { formatUnits, parseUnits } from "viem";
import { ExclamationTriangleIcon, WalletIcon } from "@heroicons/react/24/outline";
import { TokenImage } from "~~/components/common";
import { type Token } from "~~/hooks/token";
import { useTokenUsdValue } from "~~/hooks/token";
import { COW_MIN_AMOUNT } from "~~/utils";

interface TokenFieldProps {
  value: string;
  balance?: bigint;
  selectedToken: Token | null;
  sufficientAmount?: boolean;
  isDisabled?: boolean;
  tokenOptions?: Token[];
  setTokenAmount?: (amount: string) => void;
}

export const TokenAmountField: React.FC<TokenFieldProps> = ({
  value,
  balance,
  selectedToken,
  sufficientAmount,
  isDisabled,
  setTokenAmount,
}) => {
  const { tokenUsdValue, isLoading, isError } = useTokenUsdValue(selectedToken?.address, value);

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
      <div className="relative w-full rounded-lg">
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
                  onClick={setAmountToMax}
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
          {typeof tokenUsdValue === "number" ? (
            isLoading ? (
              <div>...</div>
            ) : isError ? (
              <div>price error</div>
            ) : (
              <div>${tokenUsdValue.toFixed(2)}</div>
            )
          ) : !isLoading && selectedToken && value ? (
            <div>unknown price</div>
          ) : null}
        </div>
      </div>
    </>
  );
};
