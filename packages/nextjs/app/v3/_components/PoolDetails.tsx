"use client";

import { PoolType, TokenType } from "@balancer/sdk";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { TokenImage } from "~~/components/common";
import { useReadToken } from "~~/hooks/token";
import {
  type TokenConfig,
  useFetchBoostableTokens,
  usePoolCreationStore,
  useValidatePoolCreationInput,
} from "~~/hooks/v3";
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
    amplificationParameter,
  } = usePoolCreationStore();

  const { isParametersValid, isTypeValid, isInfoValid, isTokensValid } = useValidatePoolCreationInput();

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
            <div>{name.length > 38 ? `${name.slice(0, 38)}...` : name}</div>
            <div>{symbol}</div>
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
      <div className="bg-base-100 p-4 rounded-xl text-lg">
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

  const { useBoostedVariant } = token;

  const { standardToBoosted } = useFetchBoostableTokens();

  const boostedToken = standardToBoosted[token.address];

  const { symbol: boostedSymbol } = useReadToken(boostedToken?.address);

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex items-center gap-2">
          {token?.tokenInfo && <TokenImage size="md" token={token.tokenInfo} />}
          <div className="font-bold text-lg">{useBoostedVariant ? boostedSymbol : token.tokenInfo?.symbol}</div>
          {poolType === PoolType.Weighted && <i>{token.weight}%</i>}
        </div>
        <div>{token.amount}</div>
      </div>
      {token.tokenType === TokenType.TOKEN_WITH_RATE && (
        <div className="flex gap-2 mt-1">
          <i>Rate Provider:</i>
          <div>{abbreviateAddress(token.rateProvider)}</div>
        </div>
      )}
    </div>
  );
}
