import { useMutation } from "@tanstack/react-query";
import { usePublicClient, useWalletClient } from "wagmi";
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

  const createPool = async ({ name, symbol }: CreatePoolPayload) => {
    if (!publicClient || !bCoWFactory || !walletClient) throw new Error("useCreatePool missing required setup");

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: bCoWFactory.address,
      abi: bCoWFactory.abi,
      functionName: "newBPool",
      args: [name, symbol],
    });

    const txHash = await writeTx(() => walletClient.writeContract(request), {
      onSafeTxHash: safeHash =>
        updatePoolCreation({ createPoolTx: { safeHash, wagmiHash: undefined, isSuccess: false } }),
      onWagmiTxHash: wagmiHash =>
        updatePoolCreation({ createPoolTx: { wagmiHash, safeHash: undefined, isSuccess: false } }),
    });

    return txHash;
  };

  return useMutation({
    mutationFn: (payload: CreatePoolPayload) => createPool(payload),
  });
};
