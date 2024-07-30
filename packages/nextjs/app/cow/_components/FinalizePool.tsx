"use client";

import { useState } from "react";
import { TransactionButton } from "~~/components/common";
import { useWritePool } from "~~/hooks/cow";

/**
 * Display the pool configurations
 * Set swap fee to maximum
 * Allow user to finalize the pool
 */
export const FinalizePool = ({ pool }: { pool: any }) => {
  const [isSettingFee, setIsSettingFee] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const { setSwapFee, finalize } = useWritePool(pool.address);

  const handleSetSwapFee = async () => {
    try {
      setIsSettingFee(true);
      await setSwapFee(pool.MAX_FEE);
      setIsSettingFee(false);
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
    } catch (e) {
      console.error("Error finalizing pool", e);
      setIsFinalizing(false);
    }
  };

  const requiredSwapFee = pool.MAX_FEE === pool.getSwapFee;

  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h5 className="text-2xl font-bold text-center">Finalize Pool</h5>

      <p className="text-xl text-center">Set the swap fee to the maximum and review pool configurations</p>

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
