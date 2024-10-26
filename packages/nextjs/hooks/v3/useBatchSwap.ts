// import { Path, Slippage, Swap, SwapInput, SwapKind } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
// import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";

// import { useTransactor } from "~~/hooks/scaffold-eth";

// import { usePoolCreationStore } from "~~/hooks/v3";

// TODO Implement batch swap using tokens in pool creation store
export const useBatchSwap = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  //   const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  //   const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  //   const protocolVersion = 3;
  //   const { poolAddress, poolType, tokenConfigs, updatePool, step } = usePoolCreationStore();

  async function batchSwap() {
    if (!chainId) throw new Error("Chain ID missing");
    if (!walletClient) throw new Error("Wallet client missing");

    // const swapInput: SwapInput = {
    //   chainId: chainId,
    //   paths: [] as Path[],
    //   swapKind: SwapKind.GivenIn,
    // };

    // const deadline = 999999999999999999n; // Deadline for the swap, in this case infinite
    // const slippage = Slippage.fromPercentage("0.1"); // 0.1%
    // const input = {
    //   slippage,
    //   deadline,
    //   queryOutput,
    //   wethIsEth: false,
    // };

    // const swap = new Swap(swapInput);
    // const call = swap.buildCallWithPermit2(input);

    // await writeTx(
    //   () =>
    //     walletClient.sendTransaction({
    //       account: walletClient.account,
    //       data: call.callData,
    //       to: call.to,
    //     }),
    //   {
    //     blockConfirmations: 1,
    //     onBlockConfirmation: () => {
    //       console.log("Successfully batch swapped!");
    //     },
    //   },
    // );
  }

  return useMutation({ mutationFn: () => batchSwap() });
};
