import { useState } from "react";
import Link from "next/link";
import { XMarkIcon } from "@heroicons/react/24/outline";

export const ContactSupportModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <>
      <div onClick={() => setIsModalOpen(true)} className="text-center hover:underline cursor-pointer text-lg">
        Contact Support
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
          <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
          <div className="w-[550px] relative bg-base-100 border border-base-200 rounded-lg p-7">
            <div className="flex items-center justify-between mb-7">
              <h5 className="font-bold text-3xl mb-0">Contact Support</h5>
              <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
            </div>
            <div className="text-lg mb-5">
              If you have encountered any issues or want help deciding on pool configuration, please consider these
              options:
              <br />
            </div>

            <ol className="list-disc list-inside text-lg">
              <li>
                Review our pool creation UI{" "}
                <Link
                  target="_blank"
                  rel="noreferrer"
                  href="https://docs-v3.balancer.fi/partner-onboarding/balancer-v3/pool-creation.html"
                  className="link text-info"
                >
                  documentation
                </Link>
              </li>
              <li>
                Communicate with us on{" "}
                <Link target="_blank" rel="noreferrer" href="https://discord.balancer.fi/">
                  <span className="link text-info">discord</span>
                </Link>{" "}
              </li>
              <li>
                Create an issue on{" "}
                <Link
                  className="link text-info"
                  rel="noreferrer"
                  target="_blank"
                  href="https://github.com/balancer/pool-creator/issues/new/choose"
                >
                  github
                </Link>
              </li>
            </ol>

            <div className="flex gap-3 justify-end">
              <button
                className="w-24 btn bg-base-content text-base-200 hover:bg-base-content/80 px-5 py-3 rounded-xl"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
