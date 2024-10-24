import { useState } from "react";
import { PoolCreationSteps } from "./PoolCreationSteps";
import { StepsDisplay } from "~~/app/cow/_components";
import { PoolResetModal } from "~~/app/cow/_components";
import { PoolDetails } from "~~/app/v3/_components";
import { usePoolCreationSteps, usePoolCreationStore } from "~~/hooks/v3/";

interface PoolCreationModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export function PoolCreationModal({ setIsModalOpen }: PoolCreationModalProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const { step, tokenConfigs, clearPoolStore, updatePool } = usePoolCreationStore();
  const { poolCreationSteps } = usePoolCreationSteps(tokenConfigs);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex gap-7 justify-center items-center z-50">
      <div
        className="absolute w-full h-full"
        onClick={() => {
          if (step > 1) return;
          setIsModalOpen(false);
        }}
      />
      <div className="flex flex-col gap-5 relative z-10">
        <div className="bg-base-300 rounded-lg min-w-[500px] p-5 flex flex-col gap-5">
          <div className="font-bold text-2xl text-center">Pool Creation</div>
          <PoolDetails />
          <PoolCreationSteps />
        </div>
        <div className="flex justify-center">
          <div onClick={() => setIsResetModalOpen(true)} className="text-center underline cursor-pointer text-lg mt-2">
            Reset progress
          </div>
        </div>
      </div>

      <div className="relative z-10">
        <StepsDisplay currentStepNumber={step} steps={poolCreationSteps} />
      </div>
      {isResetModalOpen && (
        <PoolResetModal
          clearState={() => {
            clearPoolStore();
            setIsModalOpen(false);
            updatePool({ selectedTab: "Type" });
          }}
          setIsModalOpen={setIsResetModalOpen}
        />
      )}
    </div>
  );
}
