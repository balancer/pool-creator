import React, { Dispatch, SetStateAction, useState } from "react";
import VirtualList from "react-tiny-virtual-list";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { TokenImage, TokenToolTip } from "~~/components/common/";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useNetworkColor } from "~~/hooks/scaffold-eth";
import { type Token } from "~~/hooks/token";

type ModalProps = {
  tokenOptions: Token[];
  setToken: (token: Token) => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};
export const TokenSelectModal: React.FC<ModalProps> = ({ tokenOptions, setIsModalOpen, setToken }) => {
  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();

  const [searchText, setSearchText] = useState("");
  const filteredTokenOptions = tokenOptions.filter(
    option =>
      (option.symbol && option.symbol.toLowerCase().startsWith(searchText.toLowerCase())) ||
      (option.address && option.address.toLowerCase().includes(searchText.toLowerCase())) ||
      (option.name && option.name.toLowerCase().includes(searchText.toLowerCase())),
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
      <div className="relative w-[500px]">
        <div className="relative bg-base-200 border border-base-200 rounded-lg">
          <div className="p-4 mb-2">
            <div className="flex items-center justify-between mb-5">
              <h5 className="ml-3 font-bold text-xl mb-0">
                Select a Token: <span style={{ color: networkColor }}>{targetNetwork.name}</span>
              </h5>

              <XMarkIcon className="w-6 h-6 hover:cursor-pointer " onClick={() => setIsModalOpen(false)} />
            </div>

            <input
              type="text"
              placeholder="Search by name, symbol, or address..."
              value={searchText}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
              className="w-full shadow-inner input rounded-xl bg-base-300 disabled:bg-base-300 px-5 h-[52px] text-lg"
            />
          </div>

          <div>
            <VirtualList
              className="flex flex-col gap-0"
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
                    <div className="flex w-full gap-4 items-center">
                      <TokenImage size="lg" token={token} />
                      <div className="text-start flex-1">
                        <div className="flex items-center gap-1 font-bold text-lg">
                          {token.symbol}
                          <TokenToolTip token={token} />
                        </div>
                        <div>
                          {token.name && token.name.length > 40 ? `${token.name.substring(0, 40)}...` : token.name}
                        </div>
                      </div>
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
