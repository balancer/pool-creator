"use client";

import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { usePoolStore } from "~~/hooks/v3";
import { abbreviateAddress } from "~~/utils/helpers";

export function PoolSummary() {
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
  } = usePoolStore();

  return (
    <div className="bg-base-200 w-full max-w-[400px] rounded-xl p-7 shadow-lg">
      <div className="font-bold text-2xl mb-7">Pool Summary</div>

      <SummarySection title="Type" isValid={poolType !== undefined} content={`${poolType} Pool`} />
      <hr className="border-base-content opacity-30 my-5" />
      <SummarySection
        title="Tokens"
        isValid={tokenConfigs.every(token => token.address !== undefined)}
        isEmpty={tokenConfigs.every(token => token.address === undefined)}
        content={
          <div className="flex flex-col gap-2">
            {tokenConfigs.map((token, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="bg-base-300 w-7 h-7 rounded-full"></div>
                <div className="font-bold">{token?.tokenInfo?.symbol}</div>
              </div>
            ))}
          </div>
        }
      />
      <hr className="border-base-content opacity-30 my-5" />
      <SummarySection
        title="Parameters"
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
      <hr className="border-base-content opacity-30 my-5" />
      <SummarySection
        title="Info"
        isValid={!!(name && symbol)}
        isEmpty={!name && !symbol}
        content={
          <div>
            <div className="flex justify-between">
              <div>Name</div>
              <div>{name}</div>
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

interface SummarySectionProps {
  title: string;
  isValid: boolean | undefined;
  isEmpty?: boolean;
  content: React.ReactNode;
}

function SummarySection({ title, isValid, isEmpty, content }: SummarySectionProps) {
  return (
    <>
      <div className="text-lg">
        <div className="flex justify-between mb-3">
          <div className="font-bold">{title}: </div>
          <div className="h-7 w-7 rounded-full">
            {isValid ? <CheckCircleIcon className="w-7 h-7" /> : <QuestionMarkCircleIcon className="w-7 h-7" />}
          </div>
        </div>
        {isEmpty ? <i>No {title.toLowerCase()} selected</i> : <div>{content}</div>}
      </div>
    </>
  );
}
