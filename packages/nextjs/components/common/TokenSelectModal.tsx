import React from "react";
import { Dispatch, SetStateAction } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { type Token } from "~~/hooks/cow";

type ModalProps = {
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};
export const TokenSelectModal: React.FC<ModalProps> = ({ tokenOptions, setIsModalOpen, setToken }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="relative w-[500px] p-7">
        <div className="relative bg-base-300 border border-base-200 rounded-lg p-7 h-[500px] overflow-y-auto">
          <XMarkIcon
            className="absolute top-7 right-7 w-7 h-7 hover:cursor-pointer"
            onClick={() => setIsModalOpen(false)}
          />

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
                  <div>-</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
