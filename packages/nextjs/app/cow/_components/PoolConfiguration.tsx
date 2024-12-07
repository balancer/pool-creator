"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { Alert, TransactionButton } from "~~/components/common";
import { TextField, TokenField } from "~~/components/common/";
import { ButtonTabs } from "~~/components/common/ButtonTabs";
import { useCheckIfPoolExists } from "~~/hooks/cow";
import { getPoolUrl } from "~~/hooks/cow/getPoolUrl";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { COW_MIN_AMOUNT } from "~~/utils";
import { SupportedTokenWeight, TokenWeightSelectItems, getPerTokenWeights } from "~~/utils/token-weights";

export const PoolConfiguration = () => {
  const { targetNetwork } = useTargetNetwork();
  const currentChainId = targetNetwork.id;
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [token1Amount, setToken1Amount] = useState<string>("");
  const [token2Amount, setToken2Amount] = useState<string>("");
  const [hasAgreedToWarning, setAgreedToWarning] = useState<boolean>(false);
  const [poolName, setPoolName] = useState<string>("");
  const [poolSymbol, setPoolSymbol] = useState<string>("");
  const { setPoolCreation } = usePoolCreationStore();
  const [tokenWeights, setTokenWeights] = useState<SupportedTokenWeight>("5050");
  const { token1Weight, token2Weight } = getPerTokenWeights(tokenWeights);

  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const availableTokens = tokenList.filter(
    token => token.address !== token1?.address && token.address !== token2?.address,
  );

  const proposedPoolTokenMap = new Map<string, string>();
  if (token1?.address) proposedPoolTokenMap.set(token1.address.toLowerCase(), token1Weight);
  if (token2?.address) proposedPoolTokenMap.set(token2.address.toLowerCase(), token2Weight);

  const { existingPool } = useCheckIfPoolExists(proposedPoolTokenMap);
  const { balance: balance1 } = useReadToken(token1?.address);
  const { balance: balance2 } = useReadToken(token2?.address);

  const { chain } = useAccount();

  useEffect(() => {
    if (typeof chain?.id === "number") {
      setToken1(null);
      setToken2(null);
      setToken1Amount("");
      setToken2Amount("");
      setAgreedToWarning(false);
      setPoolName("");
      setPoolSymbol("");
    }
  }, [chain?.id]);

  // Autofill pool name and symbol based on selected tokens
  useEffect(() => {
    if (token1 !== null && token2 !== null) {
      setPoolName(`Balancer CoW AMM ${token1Weight} ${token1.symbol} ${token2Weight} ${token2.symbol}`);
      setPoolSymbol(`BCoW-${token1Weight}${token1.symbol}-${token2Weight}${token2.symbol}`);
    } else {
      setPoolName("");
      setPoolSymbol("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token1, token2, tokenWeights]);

  const token1RawAmount = parseUnits(token1Amount, token1?.decimals ?? 0);
  const token2RawAmount = parseUnits(token2Amount, token2?.decimals ?? 0);

  // If token has less than 18 decmials, 1e6 is the min amount allowed
  const sufficientAmount1 = token1?.decimals && token1.decimals < 18 ? token1RawAmount >= COW_MIN_AMOUNT : true;
  const sufficientAmount2 = token2?.decimals && token2.decimals < 18 ? token2RawAmount >= COW_MIN_AMOUNT : true;
  const sufficientBalance1 = balance1 >= token1RawAmount;
  const sufficientBalance2 = balance2 >= token2RawAmount;

  const canProceedToCreate =
    token1 !== null &&
    token2 !== null &&
    token1RawAmount > 0n &&
    token2RawAmount > 0n &&
    hasAgreedToWarning &&
    poolName.trim() !== "" &&
    poolSymbol.trim() !== "" &&
    sufficientBalance1 &&
    sufficientBalance2 &&
    sufficientAmount1 &&
    sufficientAmount2;

  return (
    <>
      <div className="bg-base-200 p-5 rounded-xl w-full sm:w-[555px] flex flex-grow shadow-xl">
        <div className="flex flex-col items-center gap-5 w-full">
          <h5 className="text-xl md:text-2xl font-bold">Configure your pool</h5>

          <div className="w-full">
            <div className="ml-1 mb-1">Select token weights:</div>
            <ButtonTabs items={TokenWeightSelectItems} selectedId={tokenWeights} onSelect={setTokenWeights} />
          </div>

          <div className="w-full">
            <div className="ml-1 mb-1">Select pool tokens:</div>
            <div className="w-full flex flex-col gap-3">
              <TokenField
                value={token1Amount}
                balance={balance1}
                sufficientAmount={sufficientAmount1}
                selectedToken={token1}
                setToken={selectedToken => {
                  if (token2?.address === selectedToken.address) {
                    setToken2(null);
                  }
                  setToken1(selectedToken);
                }}
                setTokenAmount={setToken1Amount}
                tokenOptions={availableTokens || []}
                tokenWeight={token1Weight}
              />
              <TokenField
                value={token2Amount}
                balance={balance2}
                sufficientAmount={sufficientAmount2}
                selectedToken={token2}
                setToken={selectedToken => {
                  if (token1?.address === selectedToken.address) {
                    setToken1(null);
                  }
                  setToken2(selectedToken);
                }}
                setTokenAmount={setToken2Amount}
                tokenOptions={availableTokens || []}
                tokenWeight={token2Weight}
              />
            </div>
          </div>

          <TextField
            label="Pool name:"
            placeholder={`i.e. Balancer CoW AMM ${token1Weight} BAL ${token2Weight} DAI`}
            value={poolName}
            onChange={e => setPoolName(e.target.value)}
          />
          <TextField
            label="Pool symbol:"
            placeholder={`i.e. BCoW-${token1Weight}BAL-${token2Weight}DAI`}
            value={poolSymbol}
            onChange={e => setPoolSymbol(e.target.value)}
          />

          <TransactionButton
            title="Preview"
            isPending={false}
            isDisabled={!canProceedToCreate}
            onClick={() => {
              setPoolCreation({
                chainId: chain?.id || 0,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                token1: token1!,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                token2: token2!,
                token1Amount,
                token2Amount,
                name: poolName.trim(),
                symbol: poolSymbol.trim(),
                address: undefined,
                step: 1,
                tokenWeights,
                isInitialState: true,
              });
            }}
          />
        </div>
      </div>

      {existingPool ? (
        <Alert type="error">
          A CoW AMM pool with the selected tokens already exists! To add liquidity, go to the{" "}
          <Link
            className="link inline-block"
            rel="noopener noreferrer"
            target="_blank"
            href={getPoolUrl(currentChainId, existingPool.address)}
          >
            <div className="flex gap-1 items-center">
              Balancer app <ArrowTopRightOnSquareIcon className="w-4 h-4 mt-0.5" />
            </div>
          </Link>
        </Alert>
      ) : (
        <Alert type="warning" showIcon={false}>
          <div className="form-control">
            <label className="label cursor-pointer flex gap-4 m-0 p-0">
              <input
                type="checkbox"
                className="checkbox rounded-lg border-neutral-700"
                onChange={() => {
                  setAgreedToWarning(!hasAgreedToWarning);
                }}
                checked={hasAgreedToWarning}
              />
              <span className="">
                I understand that assets must be added proportional to the selected token weights.
              </span>
            </label>
          </div>
        </Alert>
      )}
    </>
  );
};
