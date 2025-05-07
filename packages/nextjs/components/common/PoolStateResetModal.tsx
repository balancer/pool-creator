import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PoolStateResetModalProps {
  callback: () => void;
}

export const PoolStateResetModal = ({ callback }: PoolStateResetModalProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="text-center hover:underline cursor-pointer">
        Reset Progress
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-20">
          <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
          <div className="w-[550px] relative bg-base-100 border border-base-200 rounded-lg p-6 text-base-content">
            <div className="flex items-center justify-between mb-7">
              <h5 className="font-bold text-3xl mb-0">Reset Progress</h5>
              <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
            </div>

            <div className="text-lg mb-10">
              To start over from the beginning of the pool configuration and creation process, which is the only way to
              switch the network after progress has begun, click the red button below
            </div>

            <div className="flex gap-3 justify-end">
              <button
                className="w-24 btn bg-base-content text-base-200 hover:bg-base-content/80 px-5 py-3 rounded-xl"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button onClick={callback} className="btn btn-error font-bold text-neutral-800 px-5 py-3 rounded-xl w-24">
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
