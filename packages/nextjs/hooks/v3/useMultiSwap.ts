import {
  BALANCER_BATCH_ROUTER,
  MAX_UINT256,
  Slippage,
  balancerBatchRouterAbi,
  permit2Abi,
  vaultExtensionAbi_V3,
  vaultV3Abi,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { encodeFunctionData, getContract, parseUnits, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";
import { createPermit2 } from "~~/utils/permit2Helper";

/**
 * For creating boosted pool using standard tokens
 */
export const useMultiSwap = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const { tokenConfigs, updatePool, swapToBoostedTx } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  const userData = "0x";
  const slippage = Slippage.fromPercentage("0.5"); // 0.5%
  const deadline = MAX_UINT256; // infinite
  const wethIsEth = false;

  async function multiSwap() {
    if (!chainId) throw new Error("Chain ID missing");
    if (!walletClient) throw new Error("Wallet client missing");

    const client = { public: publicClient, wallet: walletClient };
    const batchRouterAddress = BALANCER_BATCH_ROUTER[chainId];

    const batchRouterContract = getContract({
      address: batchRouterAddress,
      abi: [...balancerBatchRouterAbi, ...vaultV3Abi, ...vaultExtensionAbi_V3, ...permit2Abi],
      client,
    });

    const paths = tokenConfigs
      .filter(token => token.useBoostedVariant)
      .map(token => {
        const boostedToken = boostableWhitelist?.[token.address];
        if (!token.tokenInfo) throw new Error("Token info not found");
        if (!boostedToken) throw new Error("Boosted token not found");

        const exactAmountIn = parseUnits(token.amount, token.tokenInfo.decimals);

        return {
          tokenIn: token.address,
          steps: [
            {
              pool: boostedToken.address,
              tokenOut: boostedToken.address,
              isBuffer: true,
            },
          ],
          exactAmountIn,
          minAmountOut: 0n,
        };
      });

    // 1. Query the swap result
    const { result: querySwapExactInResult } = await batchRouterContract.simulate.querySwapExactIn([
      paths as any,
      zeroAddress,
      userData,
    ]);
    // result = (uint256[] memory pathAmountsOut, address[] memory tokensOut, uint256[] memory amountsOut)
    const [, , amountsOut] = querySwapExactInResult;
    console.log("multi swap query result", querySwapExactInResult);

    // 2. Apply slippage to each path
    const pathsWithSlippage = paths.map((path, index) => {
      // TODO figure out how to make sure the order of amountsOut match paths order?
      const minAmountOut = slippage.applyTo(amountsOut[index], -1);
      console.log("minAmountOut for", path.tokenIn, ": ", minAmountOut);
      return { ...path, minAmountOut };
    });

    // 3. Encode swap function call for multicallData arg of Batch Router's permitBatchAndCall function
    const encodedSwapData = encodeFunctionData({
      abi: balancerBatchRouterAbi,
      functionName: "swapExactIn",
      args: [pathsWithSlippage as any, deadline, wethIsEth, userData],
    });

    // 5. Setup permit2 stuffs for permitBatchAndCall
    const { batch, signature } = await createPermit2({
      chainId,
      tokens: paths.map(path => ({ address: path.tokenIn, amount: path.exactAmountIn })),
      client,
      spender: batchRouterAddress,
    });

    const args = [[], [], batch, signature, [encodedSwapData]] as const;
    console.log("batchRouter.permitBatchAndCall args", args);

    const hash = await writeTx(() => batchRouterContract.write.permitBatchAndCall(args), {
      onSafeTxHash: safeHash => updatePool({ swapToBoostedTx: { ...swapToBoostedTx, safeHash } }),
      onWagmiTxHash: wagmiHash => updatePool({ swapToBoostedTx: { ...swapToBoostedTx, wagmiHash } }),
    });

    if (!hash) throw new Error("No multi swap transaction hash");
    return hash;
  }

  return useMutation({ mutationFn: () => multiSwap() });
};

/**
 * ATTEMPT USING SDK BLOCKED BY SDK NOT ALLOWING MULTI SWAP PATHS
 */

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

// const buildCallInput = {
//   slippage,
//   deadline,
//   queryOutput,
//   wethIsEth: false,
// };

// const permit2 = await Permit2Helper.signSwapApproval({
//   ...buildCallInput,
// // I saw frontend-monorepo doing this with their useSdkWalletClient hook (necessary for permit2helper)
//   client: walletClient.extend(walletActions).extend(publicActions) as PublicWalletClient,
//   owner: walletClient.account.address as `0x${string}`,
// });
