import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { getAddress } from "viem";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Alert, ExternalLinkButton } from "~~/components/common/";
import { getPoolUrl } from "~~/hooks/cow";

interface FinishDisplayProps {
  etherscanURL: string | undefined;
  poolAddress: string | undefined;
  chainId: number;
}

export const FinishDisplay = ({ etherscanURL, poolAddress, chainId }: FinishDisplayProps) => {
  const [addressCopied, setAddressCopied] = useState(false);

  if (!poolAddress) return null;

  const checkSumAddress = getAddress(poolAddress);

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <Alert type="success">Your CoW AMM pool was successfully created!</Alert>
        <Alert type="warning">It may take a few minutes to appear in the Balancer app</Alert>
      </div>

      <div className="bg-base-200 w-full p-5 rounded-xl flex flex-col gap-5">
        <div className="flex justify-center items-center gap-2">
          <div className=" sm:text-lg overflow-hidden">{poolAddress}</div>
          <div>
            {addressCopied ? (
              <div className="!rounded-xl flex">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <CopyToClipboard
                text={checkSumAddress}
                onCopy={() => {
                  setAddressCopied(true);
                  setTimeout(() => {
                    setAddressCopied(false);
                  }, 800);
                }}
              >
                <div className="!rounded-xl flex">
                  <DocumentDuplicateIcon
                    className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                    aria-hidden="true"
                  />
                </div>
              </CopyToClipboard>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <ExternalLinkButton href={getPoolUrl(chainId, poolAddress)} text="View on Balancer" />
          {etherscanURL && <ExternalLinkButton href={etherscanURL} text="View on Etherscan" />}
        </div>
      </div>
    </>
  );
};
