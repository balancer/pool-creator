"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * This component handles forcing user to create a new pool
 * AND forcing them to set the swap fee to the required maximum
 */
export const CreatePool = () => {
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");

  const createPool = async () => {
    try {
      await bCoWFactory({
        functionName: "newBPool",
      });
    } catch (e) {
      console.error("Error creating pool", e);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h5 className="text-2xl font-bold text-center">Create Pool</h5>

      <p className="text-xl text-center">Create a new BPool using the BCoWFactory contract</p>

      <button className="btn btn-accent w-full rounded-xl text-lg mb-7 text-base-300" onClick={createPool}>
        New Pool
      </button>
    </div>
  );
};
