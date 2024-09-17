import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import VirtualList from "react-tiny-virtual-list";
import { isAddress } from "viem";
import { ExclamationTriangleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { TokenImage, TokenToolTip } from "~~/components/common/";
import { useNetworkColor, useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Token, useReadToken } from "~~/hooks/token";

type ModalProps = {
  tokenOptions: Token[];
  setToken: (token: Token) => void;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
};
export const TokenSelectModal: React.FC<ModalProps> = ({ tokenOptions, setIsModalOpen, setToken }) => {
  const [searchText, setSearchText] = useState("");
  const [exoticTokenAddress, setExoticTokenAddress] = useState<string | undefined>();
  const [showTokenWarning, setShowTokenWarning] = useState(false);

  const { name, symbol, decimals, isLoadingName, isLoadingDecimals, isLoadingSymbol } =
    useReadToken(exoticTokenAddress);

  const { targetNetwork } = useTargetNetwork();
  const networkColor = useNetworkColor();

  const filteredTokenOptions = useMemo(() => {
    return tokenOptions.filter(
      option =>
        (option.symbol && option.symbol.toLowerCase().startsWith(searchText.toLowerCase())) ||
        (option.address && option.address.toLowerCase().includes(searchText.toLowerCase())) ||
        (option.name && option.name.toLowerCase().includes(searchText.toLowerCase())),
    );
  }, [tokenOptions, searchText]);

  const exoticToken = useMemo(() => {
    if (exoticTokenAddress && name && symbol && decimals) {
      return {
        address: exoticTokenAddress,
        name,
        symbol,
        logoURI: "",
        decimals,
        chainId: targetNetwork.id,
      };
    }
  }, [exoticTokenAddress, name, symbol, decimals, targetNetwork.id]);

  useEffect(() => {
    if (filteredTokenOptions.length === 0 && isAddress(searchText)) {
      setExoticTokenAddress(searchText);
    }
    if (!isAddress(searchText)) {
      setExoticTokenAddress(undefined);
    }
  }, [searchText, filteredTokenOptions]);

  const tokenList = exoticToken ? [exoticToken] : filteredTokenOptions;
  const isLoadingExoticToken = isLoadingName || isLoadingDecimals || isLoadingSymbol;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-10">
        <div className="absolute w-full h-full" onClick={() => setIsModalOpen(false)} />
        <div className="relative w-[500px]">
          <div className="relative bg-base-200 border border-base-200 rounded-lg">
            <div className="p-4 mb-2">
              <div className="flex items-center justify-between mb-5">
                <h5 className="ml-3 font-bold text-xl mb-0">
                  Select a Token: <span style={{ color: networkColor }}>{targetNetwork.name}</span>
                </h5>

                <XMarkIcon className="w-6 h-6 hover:cursor-pointer" onClick={() => setIsModalOpen(false)} />
              </div>

              <input
                type="text"
                placeholder="Search by name, symbol, or address..."
                value={searchText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)}
                className="w-full shadow-inner input rounded-xl bg-base-300 disabled:bg-base-300 px-5 h-[52px] text-lg"
              />
            </div>
            {isLoadingExoticToken ? (
              <div className="w-full text-lg text-center">Fetching token details...</div>
            ) : tokenList.length === 0 ? (
              <div className="text-center text-lg text-error">No results found for {searchText}</div>
            ) : null}

            <div>
              <VirtualList
                className="flex flex-col gap-0"
                width="100%"
                height={500}
                itemCount={tokenList.length}
                itemSize={64}
                renderItem={({ index, style }) => {
                  const token = tokenList[index];

                  return (
                    <button
                      key={index}
                      style={style}
                      onClick={() => {
                        if (exoticTokenAddress) {
                          setShowTokenWarning(true);
                        } else {
                          setToken(token);
                          setIsModalOpen(false);
                        }
                      }}
                      className="flex w-full rounded-lg hover:bg-base-100 p-2 h-[64px] px-4"
                    >
                      <div className="flex w-full gap-4 items-center">
                        <TokenImage size="lg" token={token} />
                        <div className="flex grow justify-between">
                          <div className="text-start flex flex-col w-full">
                            <div className="flex items-center gap-1 font-bold text-lg">
                              {token.symbol}
                              <TokenToolTip token={token} />
                            </div>
                            <div>
                              {token.name && token.name.length > 40 ? `${token.name.substring(0, 40)}...` : token.name}
                            </div>
                          </div>
                          {exoticTokenAddress && (
                            <div className="flex flex-col justify-center text-error">
                              <ExclamationTriangleIcon className="w-8 h-8 hover:cursor-pointer " />
                            </div>
                          )}
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

      {showTokenWarning && exoticToken && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-20">
          <div className="relative w-[550px] bg-base-300 rounded-lg p-6 flex flex-col items-center text-center">
            <ExclamationTriangleIcon className="w-10 h-10 hover:cursor-pointer text-error mb-2" />
            <h3 className="font-bold text-2xl mb-7">Warning</h3>
            <div className="text-lg mb-10">
              This token is not included in Balancer&apos;s curated list. Please do your own research and proceed with
              caution
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <button className="btn btn-primary rounded-lg text-lg" onClick={() => setShowTokenWarning(false)}>
                Back
              </button>
              <button
                className="btn btn-error mr-2 rounded-lg text-lg"
                onClick={() => {
                  setShowTokenWarning(false);
                  setIsModalOpen(false);
                  setToken(exoticToken);
                }}
              >
                I understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
