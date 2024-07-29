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
    <div className="flex flex-col justify-center items-center gap-4">
      <h5 className="text-2xl font-bold text-center">Create Pool</h5>
      <p className="text-xl">The first step is to create a new BPool using the BCoWFactory contract</p>
      <div className="flex justify-center">
        <button className="btn btn-lg btn-primary rounded-lg text-xl" onClick={newBPool}>
          New Pool
        </button>
      </div>
    </div>
  );
};
