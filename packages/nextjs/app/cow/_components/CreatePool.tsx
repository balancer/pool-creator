"use client";

import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export const CreatePool = () => {
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");

  const newBPool = async () => {
    try {
      await bCoWFactory({
        functionName: "newBPool",
      });
    } catch (e) {
      console.error("Error creating pool", e);
    }
  };
  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <h5 className="text-2xl font-bold text-center">Create Pool</h5>
      <p className="text-xl">Create a new BPool using the BCoWFactory contract</p>

      <button className="btn btn-accent w-full rounded-xl text-lg mb-7 text-base-300" onClick={newBPool}>
        New Pool
      </button>
    </div>
  );
};
