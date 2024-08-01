"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { parseUnits } from "viem";
import { TokenField, TransactionButton } from "~~/components/common/";
import { type BCowPool, RefetchPool, useWritePool } from "~~/hooks/cow/";
import { type Token, useFetchTokenList, useReadToken, useWriteToken } from "~~/hooks/token";

export const InitializePool = ({
  pool,
  refetchPool,
}: {
  pool: BCowPool | undefined;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setUserPool: Dispatch<SetStateAction<string | undefined>>;
  refetchPool: RefetchPool;
}) => {
  const [token1, setToken1] = useState<Token>();
  const [token2, setToken2] = useState<Token>();
  const [amountToken1, setAmountToken1] = useState("");
  const [amountToken2, setAmountToken2] = useState("");

  const [isApproving, setIsApproving] = useState(false);
  const [isBinding, setIsBinding] = useState(false);

  const rawAmount1 = parseUnits(amountToken1, token1?.decimals ?? 0);
  const rawAmount2 = parseUnits(amountToken2, token2?.decimals ?? 0);

  const { data: tokenList } = useFetchTokenList();
  const {
    balance: balance1,
    allowance: allowance1,
    refetchAllowance: refetchAllowance1,
  } = useReadToken(token1?.address, pool?.address);
  const {
    balance: balance2,
    allowance: allowance2,
    refetchAllowance: refetchAllowance2,
  } = useReadToken(token2?.address, pool?.address);

  const { approve: approve1 } = useWriteToken(token1?.address, pool?.address);
  const { approve: approve2 } = useWriteToken(token2?.address, pool?.address);
  const { bind } = useWritePool(pool?.address);

  const handleApprovals = async () => {
    setIsApproving(true);
    const txs = [];
    if (rawAmount1 > allowance1) txs.push(approve1(rawAmount1));
    if (rawAmount2 > allowance2) txs.push(approve2(rawAmount2));
    await Promise.all(txs);
    refetchAllowance1();
    refetchAllowance2();
    setIsApproving(false);
  };

  const handleBindTokens = async () => {
    if (!token1 || !token2) throw new Error("Must select tokens before binding");
    setIsBinding(true);
    await Promise.all([bind(token1, rawAmount1), bind(token2, rawAmount2)]);
    refetchPool();
    setIsBinding(false);
  };

  // Load tokens from local storage on mount
  useEffect(() => {
    const savedToken1 = localStorage.getItem("token1");
    const savedToken2 = localStorage.getItem("token2");

    if (savedToken1) {
      setToken1(JSON.parse(savedToken1));
    }
    if (savedToken2) {
      setToken2(JSON.parse(savedToken2));
    }
  }, []);

  // Filter out tokens that are already selected
  const selectableTokens = tokenList?.filter(token => token !== token1 && token !== token2);
  // Must choose tokens and set amounts approve button is enabled
  const isApproveDisabled = rawAmount1 === 0n || token1 === undefined || rawAmount2 === 0n || token2 === undefined;
  // Determine if token allowances are sufficient
  const isSufficientAllowance =
    allowance1 >= rawAmount1 && allowance2 >= rawAmount2 && rawAmount1 > 0n && rawAmount2 > 0n;

  return (
    <div className="flex flex-col justify-center items-center gap-5 w-full">
      <h5 className="text-2xl font-bold">Create a Pool</h5>

      <div className="text-xl mb-3">Set amounts, approve pool, and send tokens</div>

      <>
        <TokenField
          isTokenSelectLocked={true}
          balance={balance1}
          allowance={allowance1}
          selectedToken={token1}
          setToken={setToken1}
          tokenOptions={selectableTokens}
          handleAmountChange={e => setAmountToken1(e.target.value)}
        />

        <TokenField
          isTokenSelectLocked={true}
          balance={balance2}
          allowance={allowance2}
          selectedToken={token2}
          setToken={setToken2}
          tokenOptions={selectableTokens}
          handleAmountChange={e => setAmountToken2(e.target.value)}
        />
      </>

      {!isSufficientAllowance ? (
        <TransactionButton
          title="Approve"
          isPending={isApproving}
          isDisabled={isApproveDisabled || isApproving}
          onClick={handleApprovals}
        />
      ) : (
        <TransactionButton
          title="Add Liquidity"
          isPending={isBinding}
          isDisabled={isBinding}
          onClick={handleBindTokens}
        />
      )}
    </div>
  );
};
