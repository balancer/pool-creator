"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
import { Alert, TransactionButton } from "~~/components/common";
import { TextField, TokenField } from "~~/components/common/";
import { useCheckIfPoolExists } from "~~/hooks/cow";
import { getPoolUrl } from "~~/hooks/cow/getPoolUrl";
import { usePoolCreationPersistedState } from "~~/hooks/cow/usePoolCreationState";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { type Token, useFetchTokenList, useReadToken } from "~~/hooks/token";
import { COW_MIN_AMOUNT } from "~~/utils";

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
  const setPersistedState = usePoolCreationPersistedState(state => state.setPersistedState);

  const { data } = useFetchTokenList();
  const tokenList = data || [];
  const availableTokens = tokenList.filter(
    token => token.address !== token1?.address && token.address !== token2?.address,
  );
  const { existingPool } = useCheckIfPoolExists(token1?.address, token2?.address);
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
      setPoolName(`Balancer CoW AMM 50 ${token1.symbol} 50 ${token2.symbol}`);
      setPoolSymbol(`BCoW-50${token1.symbol}-50${token2.symbol}`);
    } else {
      setPoolName("");
      setPoolSymbol("");
    }
  }, [token1, token2]);

  const token1RawAmount = parseUnits(token1Amount, token1?.decimals ?? 0);
  const token2RawAmount = parseUnits(token2Amount, token2?.decimals ?? 0);

  // If token has less than 18 decmials, 1e6 is the min amount allowed
  const sufficientAmount1 = token1?.decimals && token1.decimals < 18 ? token1RawAmount >= COW_MIN_AMOUNT : true;
  const sufficientAmount2 = token2?.decimals && token2.decimals < 18 ? token2RawAmount >= COW_MIN_AMOUNT : true;
  const sufficientBalances = balance1 > token1RawAmount && balance2 > token2RawAmount;

  const canProceedToCreate =
    token1 !== null &&
    token2 !== null &&
    token1Amount !== "" &&
    token2Amount !== "" &&
    hasAgreedToWarning &&
    poolName !== "" &&
    poolSymbol !== "" &&
    sufficientBalances &&
    sufficientAmount1 &&
    sufficientAmount2;

  return (
    <>
      <div className="bg-base-200 p-7 rounded-xl w-full sm:w-[555px] flex flex-grow shadow-lg">
        <div className="flex flex-col items-center gap-4 w-full">
          <h5 className="text-xl md:text-2xl font-bold">Configure your pool</h5>

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
                tokenOptions={availableTokens || []}
                handleAmountChange={e => setToken1Amount(e.target.value)}
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
                tokenOptions={availableTokens || []}
                handleAmountChange={e => setToken2Amount(e.target.value)}
              />
            </div>
          </div>

          <TextField
            label="Pool name:"
            placeholder="i.e. Balancer CoW AMM 50 BAL 50 DAI"
            value={poolName}
            onChange={e => setPoolName(e.target.value)}
          />
          <TextField
            label="Pool symbol:"
            placeholder="i.e. BCoW-50BAL-50DAI"
            value={poolSymbol}
            onChange={e => setPoolSymbol(e.target.value)}
          />
        </div>
      </div>

      {existingPool ? (
        <Alert type="error">
          A CoW AMM pool with the selected tokens already exists. To add liquidity, go to the{" "}
          <Link
            className="link"
            rel="noopener noreferrer"
            target="_blank"
            href={getPoolUrl(currentChainId, existingPool.address)}
          >
            Balancer app
          </Link>
        </Alert>
      ) : (
        <Alert type="warning">
          <div className="form-control">
            <label className="label cursor-pointer flex gap-4 m-0 p-0">
              <input
                type="checkbox"
                className="checkbox rounded-lg"
                onChange={() => {
                  setAgreedToWarning(!hasAgreedToWarning);
                }}
                checked={hasAgreedToWarning}
              />
              <span className="">
                I understand that assets must be added proportionally, or I risk loss of funds via arbitrage.
              </span>
            </label>
          </div>
        </Alert>
      )}

      <div className="min-w-96 px-5">
        <TransactionButton
          title="Preview"
          isPending={false}
          isDisabled={!canProceedToCreate}
          onClick={() => {
            setPersistedState({
              chainId: chain?.id || 0,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              token1: token1!,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              token2: token2!,
              token1Amount,
              token2Amount,
              poolName,
              poolSymbol,
              step: 1,
            });
          }}
        />
      </div>
    </>
  );
};
