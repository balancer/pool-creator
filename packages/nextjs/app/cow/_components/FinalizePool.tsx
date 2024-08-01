"use client";

import { useState } from "react";
import { TransactionButton } from "~~/components/common";
import { type BCowPool, RefetchPool, useWritePool } from "~~/hooks/cow";
import { useReadToken } from "~~/hooks/token/";

export const FinalizePool = ({ pool, refetchPool }: { pool: BCowPool; refetchPool: RefetchPool }) => {
  const [isSettingFee, setIsSettingFee] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { setSwapFee, finalize } = useWritePool(pool.address);

  const { name: name1, symbol: symbol1 } = useReadToken(pool.getCurrentTokens[0]);
  const { name: name2, symbol: symbol2 } = useReadToken(pool.getCurrentTokens[1]);

  const handleSetSwapFee = async () => {
    try {
      setIsSettingFee(true);
      await setSwapFee(pool.MAX_FEE);
      setIsSettingFee(false);
      refetchPool();
    } catch (e) {
      console.error("Error setting swap fee", e);
      setIsSettingFee(false);
    }
  };

  const handleFinalize = async () => {
    try {
      setIsFinalizing(true);
      await finalize();
      setIsFinalizing(false);
      refetchPool();
    } catch (e) {
      console.error("Error finalizing pool", e);
      setIsFinalizing(false);
    }
  };

  const requiredSwapFee = pool.MAX_FEE === pool.getSwapFee;

  return (
    <div className="flex flex-col flex-grow justify-between items-center gap-7">
      <h5 className="text-2xl font-bold text-center">Finalize Pool</h5>

      <div className="text-lg">{pool.address.toString()}</div>

      <div className="flex flex-col gap-3">
        <div className="bg-base-100 p-3 rounded-lg">
          <div className="font-bold">{symbol1}</div>
          <div>{name1}</div>
        </div>

        <div className="bg-base-100 p-3 rounded-lg">
          <div className="font-bold">{symbol2}</div>
          <div>{name2}</div>
        </div>
      </div>

      <div className="text-lg">
        Swap Fee: {pool.getSwapFee.toString()} {requiredSwapFee ? "✅" : "🚫"}{" "}
      </div>

      {!requiredSwapFee ? (
        <TransactionButton
          title="Set Swap Fee"
          onClick={handleSetSwapFee}
          isPending={isSettingFee}
          isDisabled={isSettingFee}
        />
      ) : (
        <TransactionButton
          title="Finalize"
          onClick={handleFinalize}
          isPending={isFinalizing}
          isDisabled={isFinalizing}
        />
      )}
    </div>
  );
};
