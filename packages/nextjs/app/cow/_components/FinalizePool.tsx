"use client";

import { useWritePool } from "~~/hooks/cow";

/**
 * Display the pool configurations
 * Set swap fee to maximum
 * Allow user to finalize the pool
 */
export const FinalizePool = ({ pool }: { pool: any }) => {
  console.log("finalize pool", pool);

  const { setSwapFee, finalize } = useWritePool(pool.address);

  const handleSetSwapFee = async () => {
    try {
      await setSwapFee(pool.MAX_FEE);
    } catch (e) {
      console.error("Error setting swap fee", e);
    }
  };

  const handleFinalize = async () => {
    try {
      await finalize();
    } catch (e) {
      console.error("Error finalizing pool", e);
    }
  };

  const requiredSwapFee = pool.MAX_FEE === pool.getSwapFee;

  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h5 className="text-2xl font-bold text-center">Finalize Pool</h5>

      <p className="text-xl text-center">Set the swap fee to the maximum and review pool configurations</p>

      {!requiredSwapFee ? (
        <button className="btn btn-accent w-full rounded-xl text-lg mb-7 text-base-300" onClick={handleSetSwapFee}>
          Set Swap Fee
        </button>
      ) : (
        <button className="btn btn-accent w-full rounded-xl text-lg mb-7 text-base-300" onClick={handleFinalize}>
          Finalize Pool
        </button>
      )}
    </div>
  );
};
