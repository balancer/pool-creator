import { useMutation } from "@tanstack/react-query";
import { Address, parseEventLogs } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useScaffoldContract, useTransactor } from "~~/hooks/scaffold-eth";

type CreatePoolPayload = {
  name: string;
  symbol: string;
};

export const useCreatePool = () => {
  const { data: bCoWFactory } = useScaffoldContract({ contractName: "BCoWFactory" });
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const writeTx = useTransactor();
  const { updatePoolCreation } = usePoolCreationStore();

  const createPool = async ({ name, symbol }: CreatePoolPayload): Promise<Address> => {
    if (!publicClient || !bCoWFactory || !walletClient) throw new Error("useCreatePool missing required setup");

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: bCoWFactory.address,
      abi: bCoWFactory.abi,
      functionName: "newBPool",
      args: [name, symbol],
    });

    const hash = await writeTx(() => walletClient.writeContract(request), {
      onTransactionHash: txHash => updatePoolCreation({ createPoolTxHash: txHash }),
    });
    if (!hash) throw new Error("No pool creation transaction hash");
    const txReceipt = await publicClient.getTransactionReceipt({ hash });
    const logs = parseEventLogs({
      abi: abis.CoW.BCoWFactory,
      logs: txReceipt.logs,
    });
    const newPool = (logs[0].args as { caller: string; bPool: string }).bPool;
    if (!newPool) throw new Error("No new pool address from pool creation tx receipt");
    console.log("New pool address from txReceipt logs:", newPool);

    return newPool;
  };

  return useMutation({
    mutationFn: (payload: CreatePoolPayload) => createPool(payload),
  });
};
