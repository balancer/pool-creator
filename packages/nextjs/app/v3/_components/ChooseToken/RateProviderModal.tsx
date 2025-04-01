import { Dispatch, SetStateAction } from "react";
import { TokenType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore, useValidateRateProvider } from "~~/hooks/v3";
import { abbreviateAddress } from "~~/utils/helpers";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth/";

export const RateProviderModal = ({
  tokenIndex,
  setShowRateProviderModal,
}: {
  tokenIndex: number;
  setShowRateProviderModal: Dispatch<SetStateAction<boolean>>;
}) => {
  const { targetNetwork } = useTargetNetwork();
  const { updateTokenConfig, tokenConfigs } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const token = tokenConfigs[tokenIndex];

  let rateProviderData = token.tokenInfo?.priceRateProviderData;
  let tokenSymbol = token.tokenInfo?.symbol;

  // TODO: something is wrong here
  if (token.useBoostedVariant) {
    const boostedVariant = boostableWhitelist?.[token.address];
    rateProviderData = boostedVariant?.priceRateProviderData;
    tokenSymbol = boostedVariant?.symbol;
  }

  const rateProviderAddress = rateProviderData?.address;

  const rateProviderLink = rateProviderData
    ? getBlockExplorerAddressLink(targetNetwork, rateProviderData.address)
    : undefined;

  const handleConfirmRateProvider = () => {
    if (rateProviderAddress) {
      updateTokenConfig(tokenIndex, {
        rateProvider: rateProviderAddress,
        tokenType: TokenType.TOKEN_WITH_RATE,
        paysYieldFees: true,
      });
    }
    setShowRateProviderModal(false);
  };

  const handleDenyRateProvider = () => {
    updateTokenConfig(tokenIndex, {
      tokenType: TokenType.STANDARD,
      rateProvider: zeroAddress,
    });
    setShowRateProviderModal(false);
  };

  const { data: rate } = useValidateRateProvider(rateProviderAddress, tokenIndex); // updates "isValidRateProvider" in tokenConfigs[index] local storage based on response to getRate()

  const isRateValid = rate !== undefined && rate !== null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
      <div className="w-[650px] min-h-[333px] bg-base-200 rounded-lg py-7 px-10 flex flex-col gap-5 justify-around">
        <h3 className="font-bold text-3xl text-center">Choose a Rate Provider</h3>

        <div className="flex flex-col gap-5">
          <div className="text-xl">
            The following rate provider for <b>{tokenSymbol} </b> has been whitelisted
          </div>
          {rateProviderData ? (
            <div className="overflow-x-auto p-3 border border-base-100 rounded-lg bg-base-300">
              <table className="w-full text-xl table ">
                <tbody>
                  <tr className="">
                    <td className="py-2 w-32">Name:</td>
                    <td className="py-2 text-left">{rateProviderData.name}</td>
                  </tr>
                  <tr className="">
                    <td className="py-2 w-32">Address:</td>
                    <td className="py-2 text-left">
                      <a
                        href={rateProviderLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-info hover:underline flex items-center gap-1"
                      >
                        {abbreviateAddress(rateProviderData.address)}
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    </td>
                  </tr>
                  <tr className="">
                    <td className="py-2">Rate:</td>
                    <td className="py-2 text-left">
                      {rate ? rate.toString() : <span className="text-red-400">???</span>}
                    </td>
                  </tr>
                  <tr className="">
                    <td className="py-2">Reviewed:</td>
                    <td className="py-2 text-left">{rateProviderData.reviewed ? "Yes" : "No"}</td>
                  </tr>
                  <tr className="">
                    <td className="py-2">Summary:</td>
                    <td className="py-2 text-left">{rateProviderData.summary}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div>No rate provider data</div>
          )}
          <div className="text-xl">
            {token.useBoostedVariant ? (
              <>
                Since you opted to boost <b>{token.tokenInfo?.symbol}</b> into <b>{tokenSymbol}</b> as part of pool
                creation, you should use the default rate provider
              </>
            ) : isRateValid ? (
              "If you wish to use this rate provider, click confirm. Otherwise, choose deny and paste in a rate provider address"
            ) : (
              <span className="text-red-400">Error fetching data from the rate provider contract!</span>
            )}
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end mt-3">
          {!token.useBoostedVariant && (
            <button className={`btn btn-error rounded-xl text-lg w-28`} onClick={() => handleDenyRateProvider()}>
              {isRateValid ? "Deny" : "Close"}
            </button>
          )}
          {isRateValid && (
            <button
              className={`btn btn-success rounded-xl text-lg w-28`}
              disabled={!rateProviderData?.address}
              onClick={() => handleConfirmRateProvider()}
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
