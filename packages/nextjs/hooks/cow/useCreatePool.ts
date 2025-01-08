import { SafeAppProvider } from "@safe-global/safe-apps-provider";
import { useSafeAppsSDK } from "@safe-global/safe-apps-react-sdk";
// import { TransactionStatus } from "@safe-global/safe-apps-sdk";
import { useMutation } from "@tanstack/react-query";
import { Address, createWalletClient, custom, parseEventLogs } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useIsSafeWallet } from "~~/hooks/safe";
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

  const { sdk, safe } = useSafeAppsSDK();
  const isSafeWallet = useIsSafeWallet();

  const createPool = async ({ name, symbol }: CreatePoolPayload): Promise<Address> => {
    if (!publicClient || !bCoWFactory || !walletClient) throw new Error("useCreatePool missing required setup");

    const { request } = await publicClient.simulateContract({
      account: walletClient.account,
      address: bCoWFactory.address,
      abi: bCoWFactory.abi,
      functionName: "newBPool",
      args: [name, symbol],
    });

    let hash: `0x${string}` | undefined;

    if (isSafeWallet) {
      const safeProvider = new SafeAppProvider(safe, sdk);
      const safeWalletClient = createWalletClient({
        transport: custom(safeProvider),
      });

      hash = await writeTx(
        () =>
          safeWalletClient.writeContract({
            ...request,
            chain: walletClient.chain,
          }),
        {
          onTransactionHash: txHash => updatePoolCreation({ createPoolTxHash: txHash }),
        },
      );

      // QUESTION: from here the safe app takes over and nothing else in this hook runs??
    } else {
      // Regular EOA flow
      hash = await writeTx(() => walletClient.writeContract(request), {
        onTransactionHash: txHash => updatePoolCreation({ createPoolTxHash: txHash }),
      });
    }

    if (!hash) throw new Error("No pool creation transaction hash");
    console.log("FINDING POOL ADDRESS FROM TX RECEIPT IN USECREATEPOOL");
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
