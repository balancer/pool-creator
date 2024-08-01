"use client";

import { Dispatch, SetStateAction, useState } from "react";
import Link from "next/link";
import { parseEventLogs, parseUnits } from "viem";
import { usePublicClient } from "wagmi";
import { TokenField, TransactionButton } from "~~/components/common/";
import { abis } from "~~/contracts/abis";
import { type BCowPool, RefetchPool, useFetchExistingPools, useWritePool } from "~~/hooks/cow/";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { type Token, useFetchTokenList, useReadToken, useWriteToken } from "~~/hooks/token";

export const InitializePool = ({
  pool,
  setCurrentStep,
  setUserPool,
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

  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isBinding, setIsBinding] = useState(false);

  const rawAmount1 = parseUnits(amountToken1, token1?.decimals ?? 0);
  const rawAmount2 = parseUnits(amountToken2, token2?.decimals ?? 0);

  const { data: tokenList } = useFetchTokenList();
  const { data: existingPools } = useFetchExistingPools();

  const existingPool = existingPools?.find(pool => {
    const poolTokenAddresses = pool.allTokens.map(token => token.address);
    const hasOnlyTwoTokens = poolTokenAddresses.length === 2;
    const selectedToken1 = token1?.address.toLowerCase() ?? "";
    const selectedToken2 = token2?.address.toLowerCase() ?? "";
    const includesToken1 = poolTokenAddresses.includes(selectedToken1);
    const includesToken2 = poolTokenAddresses.includes(selectedToken2);
    const has5050Weight = pool.allTokens.every(token => token.weight === "0.5");
    const hasMaxSwapFee = pool.dynamicData.swapFee === "0.999999";
    return hasOnlyTwoTokens && has5050Weight && hasMaxSwapFee && includesToken1 && includesToken2;
  });

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
  const publicClient = usePublicClient();

  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");
  const { approve: approve1 } = useWriteToken(token1?.address, pool?.address);
  const { approve: approve2 } = useWriteToken(token2?.address, pool?.address);
  const { bind } = useWritePool(pool?.address);

  const createPool = async () => {
    try {
      setIsCreatingPool(true);
      const hash = await bCoWFactory({
        functionName: "newBPool",
      });
      setCurrentStep(2);
      if (publicClient && hash) {
        const txReceipt = await publicClient.getTransactionReceipt({ hash });
        const logs = parseEventLogs({
          abi: abis.CoW.BCoWFactory,
          logs: txReceipt.logs,
        });
        const newPool = (logs[0].args as { caller: string; bPool: string }).bPool;
        setUserPool(newPool);
      }
      setIsCreatingPool(false);
    } catch (e) {
      console.error("Error creating pool", e);
      setIsCreatingPool(false);
    }
  };

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
      {existingPool ? (
        <div className="text-xl text-red-400">
          A CoW AMM with selected tokens{" "}
          <Link
            className="link"
            rel="noopener noreferrer"
            target="_blank"
            href={`https://balancer.fi/pools/${existingPool.chain.toLowerCase()}/cow/${existingPool.address}`}
          >
            already exists!
          </Link>
        </div>
      ) : (
        <div className="text-xl mb-3">Choose tokens and amounts for the pool</div>
      )}

      <>
        <TokenField
          balance={balance1}
          allowance={allowance1}
          selectedToken={token1}
          setToken={setToken1}
          tokenOptions={selectableTokens}
          handleAmountChange={e => setAmountToken1(e.target.value)}
        />

        <TokenField
          balance={balance2}
          allowance={allowance2}
          selectedToken={token2}
          setToken={setToken2}
          tokenOptions={selectableTokens}
          handleAmountChange={e => setAmountToken2(e.target.value)}
        />
      </>

      {!pool || pool.isFinalized || existingPool ? (
        <TransactionButton
          title="Create Pool"
          isPending={isCreatingPool}
          isDisabled={isCreatingPool || !token1 || !token2 || existingPool !== undefined}
          onClick={createPool}
        />
      ) : !isSufficientAllowance ? (
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
