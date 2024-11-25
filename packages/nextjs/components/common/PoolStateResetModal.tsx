import Link from "next/link";
import { ArrowTopRightOnSquareIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface PoolStateResetModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
  clearState: () => void;
  etherscanURL?: string | undefined;
}

export const PoolStateResetModal = ({ setIsModalOpen, clearState, etherscanURL }: PoolStateResetModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="w-[550px] relative bg-base-300 border border-base-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-7">
          <h5 className="font-bold text-3xl mb-0">Are you sure?</h5>

          <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
        </div>

        <div className="text-xl mb-5">If having trouble with pool creation process:</div>
        <ol className="list-decimal pl-5 mb-10 text-lg">
          <li>
            <span className="link cursor-pointer text-blue-400" onClick={() => window.location.reload()}>
              Refresh the page
            </span>{" "}
            after a transaction has been finalized
          </li>
          <li>
            Reach out for assistance on{" "}
            <Link target="_blank" rel="noreferrer" href="https://discord.balancer.fi/">
              <span className="link text-blue-400">discord</span>{" "}
              <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block text-blue-400" />
            </Link>
          </li>
          {etherscanURL && (
            <li>
              View the pool on a{" "}
              <Link target="_blank" rel="noreferrer" href={etherscanURL}>
                <span className="link text-blue-400">block explorer</span>{" "}
                <ArrowTopRightOnSquareIcon className="w-4 h-4 inline-block text-blue-400" />
              </Link>
            </li>
          )}
        </ol>
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
