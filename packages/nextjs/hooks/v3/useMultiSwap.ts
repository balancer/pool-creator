import {
  BALANCER_BATCH_ROUTER, // ExactInQueryOutput,
  // MAX_UINT256,
  // Permit2Helper,
  // Slippage,
  // Swap,
  // SwapInput,
  // SwapKind,
  balancerBatchRouterAbi,
  permit2Abi,
  vaultExtensionAbi_V3,
  vaultV3Abi,
} from "@balancer/sdk";
// import { PublicWalletClient } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits } from "viem";
import {
  getContract, // publicActions, walletActions,
  zeroAddress,
} from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
// import { useTransactor } from "~~/hooks/scaffold-eth";
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";

/**
 * @dev this is only used if user wants to create boosted pool using standard tokens
 */
export const useMultiSwap = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  // const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  // const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const { tokenConfigs } = usePoolCreationStore();
  const { standardToBoosted } = useFetchBoostableTokens();
  async function multiSwap() {
    if (!chainId) throw new Error("Chain ID missing");
    if (!walletClient) throw new Error("Wallet client missing");

    // const paths = tokenConfigs.map(token => {
    //   const boostedToken = standardToBoosted[token.address];
    //   if (!token.tokenInfo) throw new Error("Token info not found");
    //   if (!boostedToken) throw new Error("Boosted token not found");
    //   return {
    //     // for a given path, tokens[0] is the tokenIn and tokens[tokens.length - 1] is the tokenOut
    //     tokens: [
    //       { address: token.address, decimals: token.tokenInfo.decimals },
    //       { address: boostedToken.address, decimals: boostedToken.decimals },
    //     ],
    //     pools: [boostedToken.pool],
    //     inputAmountRaw: parseUnits(token.amount, token.tokenInfo.decimals),
    //     outputAmountRaw: 0n, // use case is only exactIn
    //     protocolVersion: 3 as const,
    //   };
    // });

    // const swapInput: SwapInput = {
    //   chainId,
    //   paths,
    //   swapKind: SwapKind.GivenIn,
    // };

    // const swap = new Swap(swapInput);
    // const queryOutput = (await swap.query(rpcUrl)) as ExactInQueryOutput;

    // const call = swap.buildCallWithPermit2(buildCallInput, permit2);

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
    //       console.log("Successfully multi swapped!");
    //     },
    //   },
    // );

    const batchRouterContract = getContract({
      address: BALANCER_BATCH_ROUTER[chainId],
      abi: [...balancerBatchRouterAbi, ...vaultV3Abi, ...vaultExtensionAbi_V3, ...permit2Abi],
      client: { public: publicClient, wallet: walletClient },
    });

    const paths = tokenConfigs.map(token => {
      const boostedToken = standardToBoosted[token.address];
      if (!token.tokenInfo) throw new Error("Token info not found");
      if (!boostedToken) throw new Error("Boosted token not found");

      return {
        tokenIn: token.address,
        steps: [
          {
            pool: boostedToken.address,
            tokenOut: boostedToken.address,
            isBuffer: true,
          },
        ],
        exactAmountIn: parseUnits(token.amount, token.tokenInfo.decimals),
        minAmountOut: 0n,
      };
    });

    const userData = "0x";

    // Query
    // result = (uint256[] memory pathAmountsOut, address[] memory tokensOut, uint256[] memory amountsOut)
    // https://github.com/balancer/balancer-v3-monorepo/blob/7a3f4ee081a49d92922cb694bbe0a669627f0919/pkg/interfaces/contracts/vault/IBatchRouter.sol#L76
    const { result } = await batchRouterContract.simulate.querySwapExactIn([paths, zeroAddress, userData]);

    console.log("multi swap result", result);
    // TODO figure out how SDK does slippage
    // const slippage = Slippage.fromPercentage("0.5"); // 0.5%
    // const deadline = MAX_UINT256; // infinite
    // const wethIsEth = false;

    // const buildCallInput = {
    //   slippage,
    //   deadline,
    //   queryOutput,
    //   wethIsEth: false,
    // };

    // const permit2 = await Permit2Helper.signSwapApproval({
    //   ...buildCallInput,
    // I saw frontend-monorepo doing this with their useSdkWalletClient hook (necessary for permit2helper)
    //   client: walletClient.extend(walletActions).extend(publicActions) as PublicWalletClient,
    //   owner: walletClient.account.address as `0x${string}`,
    // });
  }

  return useMutation({ mutationFn: () => multiSwap() });
};
