import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { usePoolCreationStore } from "~~/hooks/cow/usePoolCreationStore";
import { useTransactor } from "~~/hooks/scaffold-eth";

type SetSwapFeePayload = {
  pool: Address | undefined;
};

export const useSetSwapFee = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications
  const { updatePoolCreation } = usePoolCreationStore();
  const setSwapFee = async ({ pool }: SetSwapFeePayload) => {
    if (!publicClient) throw new Error("Cannot set swap fee public client");
    if (!walletClient) throw new Error("Cannot set swap fee wallet client");
    if (!pool) throw new Error("Cannot set swap fee without pool address");

    const MAX_FEE = await publicClient.readContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "MAX_FEE",
    });
    if (!MAX_FEE) throw new Error("Failed to fetch value for max swap fee");

    const { request: setSwapFee } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "setSwapFee",
      account: walletClient.account,
      args: [MAX_FEE],
    });

    const txHash = await writeTx(() => walletClient.writeContract(setSwapFee), {
      onSafeTxHash: safeHash => {
        updatePoolCreation({ setSwapFeeTx: { safeHash, wagmiHash: undefined, isSuccess: false } });
      },
      onWagmiTxHash: wagmiHash => {
        updatePoolCreation({ setSwapFeeTx: { wagmiHash, safeHash: undefined, isSuccess: false } });
      },
    });
    return txHash;
  };

  return useMutation({
    mutationFn: (payload: SetSwapFeePayload) => setSwapFee(payload),
  });
};
