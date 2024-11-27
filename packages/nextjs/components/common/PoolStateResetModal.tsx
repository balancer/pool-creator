import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface PoolStateResetModalProps {
  setIsModalOpen: (isOpen: boolean) => void;
  clearState: () => void;
  etherscanURL?: string | undefined;
}

export const PoolStateResetModal = ({ setIsModalOpen, clearState }: PoolStateResetModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="w-[550px] relative bg-base-100 border border-base-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-7">
          <h5 className="font-bold text-3xl mb-0">Contact Support</h5>
          <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
        </div>
        <div className="text-lg mb-5">
          If you have encountered any issues or want help deciding on pool configuration, please reach out to us on{" "}
          <Link target="_blank" rel="noreferrer" href="https://discord.balancer.fi/">
            <span className="link text-info">discord</span>{" "}
          </Link>{" "}
          or create an issue on{" "}
          <Link
            className="link text-info"
            rel="noreferrer"
            target="_blank"
            href="https://github.com/balancer/pool-creator/issues/new/choose"
          >
            github
          </Link>
        </div>
        <div className="text-lg mb-10">
          Or to reset all pool configuration and creation progress, click the red button below
        </div>

        <div className="flex gap-3 justify-end">
          <button className="w-24 btn btn-info px-5 py-3 rounded-xl" onClick={() => setIsModalOpen(false)}>
            Cancel
          </button>
          <button
            onClick={() => {
              clearState();
              setIsModalOpen(false);
            }}
            className="btn btn-error font-bold text-neutral-800 px-5 py-3 rounded-xl w-24"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};
