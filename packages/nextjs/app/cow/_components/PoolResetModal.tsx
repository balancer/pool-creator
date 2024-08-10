import { XMarkIcon } from "@heroicons/react/24/outline";

interface PoolResetModalModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
  clearState: () => void;
}

export const PoolResetModal = ({ setIsModalOpen, clearState }: PoolResetModalModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="w-[500px] relative bg-base-300 border border-base-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h5 className="font-bold text-xl mb-0">Are you sure?</h5>

          <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
        </div>

        <div className="text-lg my-10">Resetting the pool creation progress cannot be undone.</div>
        <div className="flex gap-3 justify-end">
          <button
            className="w-24 border border-base-content px-5 py-3 rounded-xl"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            onClick={clearState}
            className="text-error bg-error-tint px-5 py-3 border border-error rounded-xl w-24"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
