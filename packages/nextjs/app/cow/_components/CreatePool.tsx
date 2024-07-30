"use client";

import { useState } from "react";
import { TransactionButton } from "~~/components/common";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

/**
 * Create a new BPool using the BCoWFactory contract
 */
export const CreatePool = () => {
  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");

  const createPool = async () => {
    try {
      setIsCreatingPool(true);
      await bCoWFactory({
        functionName: "newBPool",
      });
      setIsCreatingPool(false);
    } catch (e) {
      console.error("Error creating pool", e);
      setIsCreatingPool(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center gap-7">
      <h5 className="text-2xl font-bold text-center">Create Pool</h5>
      <p className="text-xl text-center">Create a new BPool using the BCoWFactory contract</p>
      <TransactionButton title="New Pool" isPending={isCreatingPool} isDisabled={isCreatingPool} onClick={createPool} />
    </div>
  );
};
