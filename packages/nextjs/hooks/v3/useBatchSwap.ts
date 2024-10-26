import { ExactInQueryOutput, Permit2Helper, Slippage, Swap, SwapInput, SwapKind } from "@balancer/sdk";
import { PublicWalletClient } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { publicActions, walletActions } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";

/**
 * @dev this is only used if user wants to create boosted pool using standard tokens
 */
export const useBatchSwap = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const { tokenConfigs } = usePoolCreationStore();
  const { standardToBoosted } = useFetchBoostableTokens();
  async function batchSwap() {
    if (!chainId) throw new Error("Chain ID missing");
    if (!walletClient) throw new Error("Wallet client missing");

    console.log("hello");

    const paths = tokenConfigs.map(token => {
      const boostedToken = standardToBoosted[token.address];
      if (!token.tokenInfo) throw new Error("Token info not found");
      if (!boostedToken) throw new Error("Boosted token not found");
      return {
        // for a given path, tokens[0] is the tokenIn and tokens[tokens.length - 1] is the tokenOut
        tokens: [
          { address: token.address, decimals: token.tokenInfo.decimals },
          { address: boostedToken.address, decimals: boostedToken.decimals },
        ],
        pools: [boostedToken.pool],
        inputAmountRaw: parseUnits(token.amount, token.tokenInfo.decimals),
        outputAmountRaw: 0n, // use case is only exactIn
        protocolVersion: 3 as const,
      };
    });

    console.log("paths", paths);

    const swapInput: SwapInput = {
      chainId,
      paths,
      swapKind: SwapKind.GivenIn,
    };

    const swap = new Swap(swapInput);
    const queryOutput = (await swap.query(rpcUrl)) as ExactInQueryOutput;

    const slippage = Slippage.fromPercentage("0.1"); // 0.1%
    const deadline = 999999999999999999n; // infinite
    const buildCallInput = {
      slippage,
      deadline,
      queryOutput,
      wethIsEth: false,
    };

    const permit2 = await Permit2Helper.signSwapApproval({
      ...buildCallInput,
      // I saw frontend-monorepo doing this with their useSdkWalletClient hook
      client: walletClient.extend(publicActions).extend(walletActions) as PublicWalletClient,
      owner: walletClient.account.address as `0x${string}`,
    });

    const call = swap.buildCallWithPermit2(buildCallInput, permit2);

    await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to: call.to,
        }),
      {
        blockConfirmations: 1,
        onBlockConfirmation: () => {
          console.log("Successfully batch swapped!");
        },
      },
    );
  }

  return useMutation({ mutationFn: () => batchSwap() });
};
