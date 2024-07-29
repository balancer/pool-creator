"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { type Token } from "~~/app/cow/_components/ChooseTokens";
import Modal from "~~/components/common/Modal";

export const TokenSelect = ({
  tokenOptions,
  setToken,
  selectedToken,
}: {
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  selectedToken: Token | undefined;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)} className="btn btn-primary rounded-lg w-36 flex justify-between">
        {selectedToken ? selectedToken.symbol : "Select Token"} <ChevronDownIcon className="w-4 h-4 mt-0.5" />
      </button>

      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <h5 className="font-bold text-xl mb-5">Select Token</h5>
          <div className="flex flex-col gap-0 border-t border-base-content">
            {tokenOptions.map(token => (
              <button
                key={token.address}
                onClick={() => {
                  setToken(token);
                  setIsModalOpen(false);
                }}
                className="rounded-lg hover:bg-base-200 p-2"
              >
                <div className="flex justify-between items-center">
                  <div className="text-start">
                    <div>{token.symbol}</div>
                    <div>{token.name}</div>
                  </div>
                  <div>0</div>
                </div>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </>
  );
};
