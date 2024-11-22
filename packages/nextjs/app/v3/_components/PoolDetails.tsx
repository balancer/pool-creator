"use client";

import { PoolType } from "@balancer/sdk";
import { zeroAddress } from "viem";
import { CheckCircleIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { TokenImage } from "~~/components/common";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import {
  type TokenConfig,
  useBoostableWhitelist,
  usePoolCreationStore,
  useValidatePoolCreationInput,
} from "~~/hooks/v3";
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
  } = usePoolCreationStore();

  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid } = useValidatePoolCreationInput();

  const poolDeploymentUrl = poolAddress ? getBlockExplorerAddressLink(targetNetwork, poolAddress) : undefined;

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
        isEmpty={tokenConfigs.every(token => token.address === "")}
        content={
          <div className="flex flex-col gap-2">
            {tokenConfigs.map((token, index) => (
              <TokenDetails key={index} token={token} />
            ))}
          </div>
        }
      />
      <DetailSection
        title="Parameters"
        isPreview={isPreview}
        isValid={isParametersValid}
        isEmpty={false}
        content={
          <div>
            <div className="flex justify-between">
              <div className="">Swap Fee %</div>
              <div>{swapFeePercentage ? swapFeePercentage : "-"}</div>
            </div>
            {poolType === PoolType.Stable && (
              <div className="flex justify-between">
                <div className="">Amplification Parameter</div>
                <div>{amplificationParameter ? amplificationParameter : "-"}</div>
              </div>
            )}
            <div className="flex justify-between">
              <div className="">Swap Fee Manager</div>
              <div>{swapFeeManager ? abbreviateAddress(swapFeeManager) : "Balancer"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Pause Manager</div>
              <div>{pauseManager ? abbreviateAddress(pauseManager) : "Balancer"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Pool Hooks Contract</div>
              <div>{poolHooksContract ? abbreviateAddress(poolHooksContract) : "-"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Disable Unbalanced Liquidity</div>
              <div>{disableUnbalancedLiquidity ? "true" : "false"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Donations Enabled</div>
              <div>{enableDonation ? "true" : "false"}</div>
            </div>
          </div>
        }
      />
      <DetailSection
        title="Information"
        isPreview={isPreview}
        isValid={isInfoValid}
        isEmpty={!name && !symbol}
        content={
          <div>
            <div className="flex justify-between">
              <div className="">Name</div>
              <div>{name.length > 26 ? `${name.slice(0, 26)}...` : name}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Symbol</div>
              <div>{symbol.length > 26 ? `${symbol.slice(0, 26)}...` : symbol}</div>
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

  const { data: boostableWhitelist } = useBoostableWhitelist();

  const boostedToken = boostableWhitelist?.[token.address];

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {poolType === PoolType.Weighted && <span className="font-bold">{token.weight.toFixed(0)}%</span>}

          {token?.tokenInfo && <TokenImage size="md" token={token.tokenInfo} />}
          <div className="font-bold text-lg">
            {token.useBoostedVariant ? boostedToken?.symbol : token.tokenInfo?.symbol}
          </div>
        </div>
        <div>{token.amount}</div>
      </div>
      {token.rateProvider && token.rateProvider !== zeroAddress && (
        <div className="flex gap-2 mt-1">
          <i>Rate Provider:</i>
          <div>{abbreviateAddress(token.rateProvider)}</div>
        </div>
      )}
    </div>
  );
}
