import { Dispatch, SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { TokenSelectModal } from "~~/components/common";
import { TransactionButton } from "~~/components/common/";
import { abis } from "~~/contracts/abis";
import { useFetchExistingPools } from "~~/hooks/cow";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { type Token, useFetchTokenList } from "~~/hooks/token";

export const CreatePool = ({
  setCurrentStep,
  setUserPool,
}: {
  setCurrentStep: (step: number) => void;
  setUserPool: (pool: string | undefined) => void;
}) => {
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const [isCreatingPool, setIsCreatingPool] = useState(false);
  const [token1, setToken1] = useState<Token>();
  const [token2, setToken2] = useState<Token>();

  const publicClient = usePublicClient();
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");

  const { data: tokenList } = useFetchTokenList();
  const { data: existingPools } = useFetchExistingPools();

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

  // Save tokens to local storage when they change
  useEffect(() => {
    if (token1) {
      localStorage.setItem("token1", JSON.stringify(token1));
    }
    if (token2) {
      localStorage.setItem("token2", JSON.stringify(token2));
    }
  }, [token1, token2]);

  // Filter out tokens that are already selected
  const selectableTokens = tokenList?.filter(token => token !== token1 && token !== token2);

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

  return (
    <>
      <div className="flex flex-col justify-between items-center gap-5 w-full">
        <div>
          <h5 className="text-2xl font-bold text-center mb-5">Create a Pool</h5>

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
            <div className="text-xl">Choose two tokens for the pool</div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <ChooseTokenButton
            selectedToken={token1}
            setToken={setToken1}
            isModalOpen={isModalOpen1}
            tokenOptions={selectableTokens}
            setIsModalOpen={setIsModalOpen1}
          />
          <ChooseTokenButton
            selectedToken={token2}
            setToken={setToken2}
            isModalOpen={isModalOpen2}
            tokenOptions={selectableTokens}
            setIsModalOpen={setIsModalOpen2}
          />
        </div>

        <TransactionButton
          title="Create Pool"
          isPending={isCreatingPool}
          isDisabled={isCreatingPool || !token1 || !token2 || existingPool !== undefined}
          onClick={createPool}
        />
      </div>
    </>
  );
};

const ChooseTokenButton = ({
  isModalOpen,
  tokenOptions,
  setToken,
  setIsModalOpen,
  selectedToken,
}: {
  isModalOpen: boolean;
  tokenOptions: Token[] | undefined;
  setToken: Dispatch<SetStateAction<Token | undefined>>;
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedToken: Token | undefined;
}) => {
  return (
    <>
      <div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="p-3 font-bold bg-base-100 rounded-lg flex justify-between items-center gap-3 text-lg min-w-52"
        >
          {selectedToken ? selectedToken.symbol : "Select Token"} <ChevronDownIcon className="w-4 h-4 mt-0.5" />
        </button>
      </div>

      {isModalOpen && tokenOptions && (
        <TokenSelectModal tokenOptions={tokenOptions} setToken={setToken} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};
