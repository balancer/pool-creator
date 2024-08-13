import { useMutation } from "@tanstack/react-query";
import { Address } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { abis } from "~~/contracts/abis";
import { useTransactor } from "~~/hooks/scaffold-eth";

type SetSwapFeePayload = {
  pool: Address | undefined;
  rawAmount: bigint | undefined;
};

export const useSetSwapFee = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications

  const setSwapFee = async ({ pool, rawAmount }: SetSwapFeePayload) => {
    if (!publicClient) throw new Error("Cannot set swap fee public client");
    if (!walletClient) throw new Error("Cannot set swap fee wallet client");
    if (!pool) throw new Error("Cannot set swap fee without pool address");
    if (!rawAmount) throw new Error("Cannot set swap fee without swap fee amount");

    const { request: setSwapFee } = await publicClient.simulateContract({
      abi: abis.CoW.BCoWPool,
      address: pool,
      functionName: "setSwapFee",
      account: walletClient.account,
      args: [rawAmount],
    });

    await writeTx(() => walletClient.writeContract(setSwapFee), {
      blockConfirmations: 1,
      onBlockConfirmation: txReciept => {
        if (txReciept.status !== "success") throw new Error("Set swap fee transaction reverted");
        console.log("Set swap fee to", rawAmount, "for pool:", pool);
      },
    });
  };

  return useMutation({
    mutationFn: (payload: SetSwapFeePayload) => setSwapFee(payload),
  });
};
