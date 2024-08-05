import React, { Dispatch, SetStateAction, useState } from "react";
import VirtualList from "react-tiny-virtual-list";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { type Token } from "~~/hooks/token";

type ModalProps = {
  tokenOptions: Token[];
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};
export const TokenSelectModal: React.FC<ModalProps> = ({ tokenOptions, setIsModalOpen, setToken }) => {
  const [searchText, setSearchText] = useState("");
  const filteredTokenOptions = tokenOptions.filter(option =>
    option.symbol.toLowerCase().startsWith(searchText.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="relative w-[500px]">
        <div className="relative bg-base-300 border border-base-200 rounded-lg">
          <div className="p-4">
            <XMarkIcon
              className="absolute top-4 right-4 w-7 h-7 hover:cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            />

            <h5 className="font-bold text-xl mb-5">Select Token</h5>
            <input
              type="text"
              placeholder="Search by symbol..."
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              className="w-full input input-bordered rounded-xl bg-base-200 disabled:bg-base-300 px-5 h-[52px] text-lg"
            />
          </div>
          <div className="flex flex-col gap-0 border-t border-base-content">
            <VirtualList
              className="flex flex-col gap-0 border-t border-base-content"
              width="100%"
              height={500}
              itemCount={filteredTokenOptions.length}
              itemSize={64}
              renderItem={({ index, style }) => {
                const token = filteredTokenOptions[index];

                return (
                  <button
                    key={index}
                    style={style}
                    onClick={() => {
                      setToken(token);
                      setIsModalOpen(false);
                    }}
                    className="flex w-full rounded-lg hover:bg-base-200 p-2 h-[64px] px-4"
                  >
                    <div className="flex w-full justify-between items-center">
                      <div className="text-start flex-1">
                        <div>{token.symbol}</div>
                        <div>{token.name.length > 40 ? `${token.name.substring(0, 40)}...` : token.name}</div>
                      </div>
                      {/*<div>-</div>*/}
                    </div>
                  </button>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
