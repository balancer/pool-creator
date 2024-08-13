import { useMutation } from "@tanstack/react-query";
import { Address, parseEventLogs } from "viem";
import { usePublicClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

type CreatePoolPayload = {
  name: string;
  symbol: string;
};

export const useCreatePool = () => {
  const { writeContractAsync: bCoWFactory } = useScaffoldWriteContract("BCoWFactory");
  const publicClient = usePublicClient();

  const createPool = async ({ name, symbol }: CreatePoolPayload): Promise<Address> => {
    if (!publicClient) throw new Error("No public client");
    const hash = await bCoWFactory({
      functionName: "newBPool",
      args: [name, symbol],
    });
    if (!hash) throw new Error("No pool creation transaction hash");
    const txReceipt = await publicClient.getTransactionReceipt({ hash });
    if (txReceipt.status !== "success") throw new Error("Pool creation transaction reverted");
    const logs = parseEventLogs({
      abi: abis.CoW.BCoWFactory,
      logs: txReceipt.logs,
    });
    const newPool = (logs[0].args as { caller: string; bPool: string }).bPool;
    console.log("New pool address from txReceipt logs:", newPool);

    return newPool;
  };

  return useMutation({
    mutationFn: (payload: CreatePoolPayload) => createPool(payload),
  });
};
