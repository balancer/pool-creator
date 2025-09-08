import { useState } from "react";
import { getAddress } from "viem";
import { CheckCircleIcon, DocumentDuplicateIcon } from "@heroicons/react/24/outline";
import { Alert, ExternalLinkButton, TransactionButton } from "~~/components/common/";
import { getPoolUrl } from "~~/hooks/cow";
import { extractDomain } from "~~/utils/helpers";

interface PoolCreatedProps {
  etherscanURL: string | undefined;
  poolAddress: string | undefined;
  chainId: number;
  clearState: () => void;
}

export const PoolCreated = ({ etherscanURL, poolAddress, chainId, clearState }: PoolCreatedProps) => {
  const [addressCopied, setAddressCopied] = useState(false);

  if (!poolAddress) return null;

  const checkSumAddress = getAddress(poolAddress);

  const domainName = extractDomain(etherscanURL || "");
  const blockExplorerName = domainName.split(".")[0];

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(checkSumAddress);
      setAddressCopied(true);
      setTimeout(() => {
        setAddressCopied(false);
      }, 800);
    } catch (err) {
      console.error("Failed to copy address:", err);
    }
  };

  return (
    <>
      <div className="bg-base-200 w-full p-6 rounded-xl flex flex-col gap-6 shadow-xl justify-center items-center">
        <h5 className="text-2xl font-bold">View your pool</h5>
        <div className="flex justify-center items-center gap-2">
          <div className="text-sm sm:text-lg">{poolAddress}</div>
          <div>
            {addressCopied ? (
              <div className="!rounded-xl flex">
                <CheckCircleIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
              </div>
            ) : (
              <div className="!rounded-xl flex cursor-pointer" onClick={handleCopyAddress}>
                <DocumentDuplicateIcon
                  className="text-xl font-normal h-6 w-4 cursor-pointer ml-2 sm:ml-0"
                  aria-hidden="true"
                />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
          <ExternalLinkButton href={getPoolUrl(chainId, poolAddress)} text="View on Balancer" />
          {etherscanURL && domainName !== "" && (
            <ExternalLinkButton href={etherscanURL} text={`View on ${blockExplorerName}`} />
          )}
        </div>
        <Alert type="warning">It may take a few minutes to appear in the Balancer app</Alert>
      </div>
      <div className="w-full">
        <TransactionButton
          title="Create Another Pool"
          onClick={() => clearState()}
          isPending={false}
          isDisabled={false}
        />
      </div>
    </>
  );
};
