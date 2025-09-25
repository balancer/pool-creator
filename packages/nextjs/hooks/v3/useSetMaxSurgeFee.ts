import { usePoolCreationStore } from "./usePoolCreationStore";
import { usePoolHooksWhitelist } from "./usePoolHooksWhitelist";
import { useMutation } from "@tanstack/react-query";
import { parseAbi, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";

export const useSetMaxSurgeFee = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor(); // scaffold hook for tx status toast notifications
  const { updatePool, setMaxSurgeFeeTx, poolAddress, chain } = usePoolCreationStore();
  const { poolHooksWhitelist } = usePoolHooksWhitelist(chain?.id);

  const stableSurgeHookAddress = poolHooksWhitelist.find(hook => hook.label === "StableSurge")?.value;

  const setMaxSurgeFee = async () => {
    if (!poolAddress) throw new Error("useSetMaxSurgeFee: poolAddress is undefined");
    if (!walletClient) throw new Error("useApproveToken: wallet client is undefined");
    if (!publicClient) throw new Error("useApproveToken: public client is undefined");
    if (!stableSurgeHookAddress) throw new Error("useSetMaxSurgeFee: stableSurgeHookAddress is undefined");

    console.log("stableSurgeHookAddress", stableSurgeHookAddress);

    const { request: setMaxFee } = await publicClient.simulateContract({
      address: stableSurgeHookAddress, // stable surge hook address
      abi: parseAbi(["function setMaxSurgeFeePercentage(address pool, uint256 newMaxSurgeSurgeFeePercentage)"]),
      functionName: "setMaxSurgeFeePercentage",
      account: walletClient.account,
      args: [poolAddress, parseUnits("10", 16)], // fixed to 10% ?
    });

    console.log("setMaxFee", setMaxFee);

    const txHash = await writeTx(() => walletClient.writeContract(setMaxFee), {
      // callbacks to save tx hash's to store
      onSafeTxHash: safeHash => updatePool({ setMaxSurgeFeeTx: { ...setMaxSurgeFeeTx, safeHash } }),
      onWagmiTxHash: wagmiHash => updatePool({ setMaxSurgeFeeTx: { ...setMaxSurgeFeeTx, wagmiHash } }),
    });
    console.log("Approved pool contract to spend token, txHash:", txHash);
    return txHash;
  };

  return useMutation({
    mutationFn: () => setMaxSurgeFee(),
    onError: error => {
      console.error(error);
    },
  });
};
