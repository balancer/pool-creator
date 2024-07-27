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
    <div className="my-10">
      <div className="flex justify-center">
        <button className="btn btn-lg btn-accent rounded-lg text-xl" onClick={newBPool}>
          Create Pool
        </button>
      </div>
      <p className="text-xl mt-10">The first step is to create a new BPool using the BCoWFactory contract</p>
    </div>
  );
};
