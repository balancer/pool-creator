import Link from "next/link";
import { ArrowTopRightOnSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface PoolResetModalModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
  clearState: () => void;
  etherscanURL: string | undefined;
}

export const PoolResetModal = ({ setIsModalOpen, clearState, etherscanURL }: PoolResetModalModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="w-[500px] relative bg-base-300 border border-base-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-5">
          <h5 className="font-bold text-2xl mb-0">Are you sure?</h5>

          <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
        </div>

        <div className="text-lg mb-5">If you are having trouble with the pool creation process, please consider:</div>
        <ul className="list-disc pl-5 mb-10 text-lg">
          <li>
            Reaching out for assistance on{" "}
            <Link
              target="_blank"
              rel="noreferrer"
              href="https://discord.com/channels/638460494168064021/1246145461123809292"
            >
              <span className="link">discord</span> <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block" />
            </Link>
          </li>
          {etherscanURL && (
            <li>
              Viewing the pool on a{" "}
              <Link target="_blank" rel="noreferrer" href={etherscanURL}>
                <span className="link">block explorer</span>{" "}
                <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block" />
              </Link>
            </li>
          )}
        </ul>
        <div className="flex gap-3 justify-end">
          <button
            className="w-24 border border-base-content px-5 py-3 rounded-xl"
            onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              clearState();
              setIsModalOpen(false);
            }}
            className="bg-error text-neutral-800 px-5 py-3 border border-error rounded-xl w-24"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
