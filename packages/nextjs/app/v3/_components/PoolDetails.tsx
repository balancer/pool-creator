"use client";

import { EclpChartDisplay } from "./PoolConfiguration/ChooseParameters/EclpParams";
import { PoolType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { TokenImage, TokenToolTip } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import {
  type TokenConfig,
  useBoostableWhitelist,
  usePoolCreationStore,
  useUserDataStore,
  useValidateCreationInputs,
} from "~~/hooks/v3";
import { usePoolHooksWhitelist } from "~~/hooks/v3";
import { abbreviateAddress } from "~~/utils/helpers";
import { getBlockExplorerAddressLink } from "~~/utils/scaffold-eth/";

export function PoolDetails({ isPreview }: { isPreview?: boolean }) {
  const { targetNetwork } = useTargetNetwork();

  const {
    poolType,
    tokenConfigs,
    swapFeePercentage,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
    disableUnbalancedLiquidity,
    enableDonation,
    name,
    symbol,
    amplificationParameter,
    poolAddress,
    reClammParams,
    isDelegatingPauseManagement,
    isDelegatingSwapFeeManagement,
    step,
    setIsChooseTokenAmountsModalOpen,
    selectedTab,
    chain,
  } = usePoolCreationStore();
  const { poolHooksWhitelist } = usePoolHooksWhitelist(chain?.id);

  const { isOnlyInitializingPool } = useUserDataStore();

  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid } = useValidateCreationInputs();
  const { initialTargetPrice, initialMinPrice, initialMaxPrice, dailyPriceShiftExponent, centerednessMargin } =
    reClammParams;

  const poolDeploymentUrl = poolAddress ? getBlockExplorerAddressLink(targetNetwork, poolAddress) : undefined;

  const isGyroEclp = poolType === PoolType.GyroE;
  const isStablePool = poolType === PoolType.Stable || poolType === PoolType.StableSurge;
  const isReClamm = poolType === PoolType.ReClamm;

  const showMiniEclpChart = isGyroEclp && selectedTab === "Information";

  const poolHooksName = poolHooksWhitelist.find(
    hook => hook.value.toLowerCase() === poolHooksContract.toLowerCase(),
  )?.label;

  return (
    <div className="flex flex-col gap-3">
      <DetailSection
        title="Type"
        isPreview={isPreview}
        isValid={isTypeValid}
        isEmpty={poolType === undefined}
        content={`${poolType} Pool`}
      />
      <DetailSection
        title="Tokens"
        isPreview={isPreview}
        isValid={isTokensValid}
        isEmpty={tokenConfigs.every(token => token.address === zeroAddress)}
        content={
          <div className="flex flex-col gap-2 relative">
            {(step === 2 || step === 3) && (
              <div className="absolute -top-10 -right-1">
                <div
                  className="btn btn-sm btn-ghost text-info rounded-lg"
                  onClick={() => setIsChooseTokenAmountsModalOpen(true)}
                >
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
              </div>
            )}
            {tokenConfigs.map((token, index) => (
              <TokenDetails key={index} token={token} />
            ))}
          </div>
        }
      />
      {!isOnlyInitializingPool && (
        <DetailSection
          title="Parameters"
          isPreview={isPreview}
          isValid={isParametersValid}
          isEmpty={false}
          content={
            <div>
              {showMiniEclpChart && (
                <div className="mb-3">
                  <EclpChartDisplay size="mini" />
                </div>
              )}
              {isStablePool && (
                <div className="flex justify-between">
                  <div className="">Amplification Parameter</div>
                  <div>{amplificationParameter ? amplificationParameter : "-"}</div>
                </div>
              )}
              {isReClamm && (
                <>
                  <div className="flex justify-between">
                    <div className="">Initial Min Price</div>
                    <div>
                      {initialMinPrice
                        ? initialMinPrice.length > 15
                          ? initialMinPrice.slice(0, 15) + "..."
                          : initialMinPrice
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="">Initial Target Price</div>
                    <div>
                      {initialTargetPrice
                        ? initialTargetPrice.length > 15
                          ? initialTargetPrice.slice(0, 15) + "..."
                          : initialTargetPrice
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="">Initial Max Price</div>
                    <div>
                      {initialMaxPrice
                        ? initialMaxPrice.length > 15
                          ? initialMaxPrice.slice(0, 15) + "..."
                          : initialMaxPrice
                        : "-"}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="">Price Shift Daily Rate</div>
                    <div>{dailyPriceShiftExponent ? dailyPriceShiftExponent : "-"}</div>
                  </div>
                  <div className="flex justify-between">
                    <div className="">Centeredness Margin</div>
                    <div>{centerednessMargin ? centerednessMargin : "-"}</div>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <div className="">Swap Fee</div>
                <div>{swapFeePercentage ? swapFeePercentage + "%" : "-"}</div>
              </div>
              <div className="flex justify-between">
                <div className="">Swap Fee Manager</div>
                <div>
                  {isDelegatingSwapFeeManagement ? (
                    "Balancer"
                  ) : swapFeeManager ? (
                    <a
                      href={getBlockExplorerAddressLink(targetNetwork, swapFeeManager)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-info hover:underline"
                    >
                      {abbreviateAddress(swapFeeManager)}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>
              <div className="flex justify-between">
                <div className="">Pause Manager</div>
                <div>
                  {isDelegatingPauseManagement ? (
                    "Balancer"
                  ) : pauseManager ? (
                    <a
                      href={getBlockExplorerAddressLink(targetNetwork, pauseManager)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-info hover:underline"
                    >
                      {abbreviateAddress(pauseManager)}
                      <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    </a>
                  ) : (
                    "-"
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between">
                  <div className="">Pool Hooks Contract</div>
                  <div>
                    {poolHooksContract === zeroAddress ? (
                      "None"
                    ) : !poolHooksContract ? (
                      "-"
                    ) : (
                      <a
                        className="link text-info no-underline flex gap-1 items-center"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={getBlockExplorerAddressLink(targetNetwork, poolHooksContract)}
                      >
                        {poolHooksName ? poolHooksName : abbreviateAddress(poolHooksContract)}
                        <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="">Allow unbalanced</div>
                  <div>{disableUnbalancedLiquidity ? "no" : "yes"}</div>
                </div>
                <div className="flex justify-between">
                  <div className="">Allow donations</div>
                  <div>{enableDonation ? "yes" : "no"}</div>
                </div>
              </div>
            </div>
          }
        />
      )}
      <DetailSection
        title="Information"
        isPreview={isPreview}
        isValid={isInfoValid}
        isEmpty={!name && !symbol}
        content={
          <div>
            <div className="flex justify-between">
              <div className="">Name</div>
              {name.length > 26 ? (
                <div className="tooltip tooltip-primary cursor-pointer" data-tip={name}>
                  {`${name.slice(0, 26)}...`}
                </div>
              ) : (
                <div>{name}</div>
              )}
            </div>
            <div className="flex justify-between">
              <div className="">Symbol</div>
              {symbol.length > 20 ? (
                <div className="tooltip tooltip-primary cursor-pointer" data-tip={symbol}>
                  {`${symbol.slice(0, 20)}...`}
                </div>
              ) : (
                <div>{symbol}</div>
              )}
            </div>
            <div className="flex justify-between">
              <div className="">Address</div>
              <div>
                {poolAddress ? (
                  <a
                    href={poolDeploymentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-info hover:underline"
                  >
                    {abbreviateAddress(poolAddress)}
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                ) : (
                  "TBD"
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

interface DetailSectionProps {
  title: string;
  isValid: boolean | undefined;
  isEmpty?: boolean;
  isPreview?: boolean;
  content: React.ReactNode;
}

function DetailSection({ title, isValid, isEmpty, isPreview, content }: DetailSectionProps) {
  return (
    <>
      <div className="bg-base-100 p-4 rounded-xl text-lg shadow-sm border border-neutral">
        <div className="flex justify-between mb-2">
          <div className="font-bold text-xl">{title}: </div>
          {isPreview && (
            <div className="h-7 w-7 rounded-full">
              {isValid ? (
                <CheckCircleIcon className="w-7 h-7 text-success" />
              ) : (
                <QuestionMarkCircleIcon className="w-7 h-7" />
              )}
            </div>
          )}
        </div>
        {isEmpty ? <i>No {title.toLowerCase()} selected</i> : <div>{content}</div>}
      </div>
    </>
  );
}

function TokenDetails({ token }: { token: TokenConfig }) {
  const { poolType } = usePoolCreationStore();
  const { targetNetwork } = useTargetNetwork();
  const { paysYieldFees } = token;

  const { data: boostableWhitelist } = useBoostableWhitelist();

  const boostedToken = boostableWhitelist?.[token.address];

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center gap-1.5">
          {poolType === PoolType.Weighted && token?.weight && (
            <span className="font-bold"> {Number(token.weight).toFixed(0)}%</span>
          )}

          {token?.tokenInfo && <TokenImage size="md" token={token.tokenInfo} />}
          <div className="font-bold text-lg">
            {token.useBoostedVariant ? boostedToken?.symbol : token.tokenInfo?.symbol}
          </div>
          {token.tokenInfo && (
            <div>
              <TokenToolTip token={token.useBoostedVariant && boostedToken ? boostedToken : token.tokenInfo} />
            </div>
          )}
        </div>
        <div>{token.amount.length > 15 ? `${token.amount.slice(0, 15)}...` : token.amount}</div>
      </div>
      {token.rateProvider && token.rateProvider !== zeroAddress && (
        <>
          <div className="flex gap-1 mt-1 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.49 12 3.75 3.75m0 0-3.75 3.75m3.75-3.75H3.74V4.499"
              />
            </svg>
            Rate Provider :
            <div>
              {" "}
              <a
                href={getBlockExplorerAddressLink(targetNetwork, token.rateProvider)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-info hover:underline"
              >
                {abbreviateAddress(token.rateProvider)}
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="flex gap-1 ml-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.49 12 3.75 3.75m0 0-3.75 3.75m3.75-3.75H3.74V4.499"
              />
            </svg>
            Pays Yield Fees: {paysYieldFees ? "Yes" : "No"}
          </div>
        </>
      )}
    </div>
  );
}
