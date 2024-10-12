"use client";

import { PoolType } from "@balancer/sdk";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { usePoolCreationStore } from "~~/hooks/v3";
import { abbreviateAddress } from "~~/utils/helpers";

export function PoolDetails({ isPreview }: { isPreview?: boolean }) {
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
  } = usePoolCreationStore();

  return (
    <div className="flex flex-col gap-3">
      <DetailSection
        title="Type"
        isPreview={isPreview}
        isValid={poolType !== undefined}
        isEmpty={poolType === undefined}
        content={`${poolType} Pool`}
      />
      <DetailSection
        title="Tokens"
        isPreview={isPreview}
        isValid={tokenConfigs.every(token => token.address !== "")}
        isEmpty={tokenConfigs.every(token => token.address === "")}
        content={
          <div className="flex flex-col gap-2">
            {tokenConfigs.map((token, index) => (
              <div key={index} className="flex justify-between">
                <div className="flex items-center gap-2">
                  {poolType === PoolType.Weighted && <div>{token.weight}%</div>}
                  <div className="bg-base-300 w-7 h-7 rounded-full"></div>
                  <div className="font-bold">{token?.tokenInfo?.symbol}</div>
                </div>
                <div>{token.amount}</div>
              </div>
            ))}
          </div>
        }
      />
      <DetailSection
        title="Parameters"
        isPreview={isPreview}
        isValid={!!(swapFeePercentage && swapFeeManager && pauseManager)}
        isEmpty={!swapFeePercentage && !swapFeeManager && !pauseManager}
        content={
          <div>
            <div className="flex justify-between">
              <div className="">Swap Fee %</div>
              <div>{swapFeePercentage ? swapFeePercentage : "-"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Swap Fee Manager</div>
              <div>{swapFeeManager ? abbreviateAddress(swapFeeManager) : "-"}</div>
            </div>
            <div className="flex justify-between">
              <div className="">Pause Manager</div>
              <div>{pauseManager ? abbreviateAddress(pauseManager) : "-"}</div>
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
        title="Info"
        isPreview={isPreview}
        isValid={!!(name && symbol)}
        isEmpty={!name && !symbol}
        content={
          <div>
            <div className="flex justify-between">
              <div>Name</div>
              <div>{name.length > 24 ? `${name.slice(0, 24)}...` : name}</div>
            </div>
            <div className="flex justify-between">
              <div>Symbol</div>
              <div>{symbol}</div>
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
      <div className="text-lg bg-base-100 p-4 rounded-xl">
        <div className="flex justify-between mb-2">
          <div className="font-bold">{title}: </div>
          {isPreview && (
            <div className="h-7 w-7 rounded-full">
              {isValid ? <CheckCircleIcon className="w-7 h-7" /> : <QuestionMarkCircleIcon className="w-7 h-7" />}
            </div>
          )}
        </div>
        {isEmpty ? <i>No {title.toLowerCase()} selected</i> : <div>{content}</div>}
      </div>
    </>
  );
}
