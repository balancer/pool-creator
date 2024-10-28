import {
  AllowanceTransfer,
  BALANCER_BATCH_ROUTER,
  MAX_UINT256,
  MaxAllowanceExpiration,
  MaxSigDeadline,
  PERMIT2,
  type Permit2,
  Permit2Batch,
  PermitDetails,
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
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";

/**
 * @dev this is only used if user wants to create boosted pool using standard tokens
 */
export const useMultiSwap = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  // const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const { tokenConfigs } = usePoolCreationStore();
  const { standardToBoosted } = useFetchBoostableTokens();

  const userData = "0x";
  const slippage = Slippage.fromPercentage("0.5"); // 0.5%
  const deadline = MAX_UINT256; // infinite
  const wethIsEth = false;

  async function multiSwap() {
    if (!chainId) throw new Error("Chain ID missing");
    if (!walletClient) throw new Error("Wallet client missing");

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

    // result = (uint256[] memory pathAmountsOut, address[] memory tokensOut, uint256[] memory amountsOut)
    const { result: querySwapExactInResult } = await batchRouterContract.simulate.querySwapExactIn([
      paths,
      zeroAddress,
      userData,
    ]);
    const [, , amountsOut] = querySwapExactInResult;
    console.log("multi swap result", querySwapExactInResult);

    // TODO figure out how to make sure the order of amountsOut match paths order?
    const pathsWithSlippage = paths.map((path, index) => {
      const minAmountOut = slippage.applyTo(amountsOut[index], -1);
      console.log("minAmountOut", minAmountOut);
      return { ...path, minAmountOut };
    });

    // encode swap data for multicallData arg of Batch Router's permitBatchAndCall function
    const encodedSwapData = encodeFunctionData({
      abi: balancerBatchRouterAbi,
      functionName: "swapExactIn",
      args: [pathsWithSlippage, deadline, wethIsEth, userData],
    });

    const permit2Contract = getContract({
      address: PERMIT2[chainId],
      abi: permit2Abi,
      client: { public: publicClient, wallet: walletClient },
    });

    // TODO: figure out how to fetch nonce for each token and plug into PermitDetails below
    const allowanceResult = await permit2Contract.read.allowance([
      walletClient.account.address,
      tokenConfigs[0].address,
      BALANCER_BATCH_ROUTER[chainId],
    ]);
    console.log("allowance result", allowanceResult);

    //
    const details: PermitDetails[] = await Promise.all(
      tokenConfigs.map(async token => {
        if (!token.tokenInfo?.decimals) throw new Error("Token decimals not found");

        const [, , nonce] = await permit2Contract.read.allowance([
          walletClient.account.address,
          token.address,
          BALANCER_BATCH_ROUTER[chainId],
        ]);

        return {
          token: token.address,
          amount: parseUnits(token.amount, token.tokenInfo.decimals),
          expiration: Number(MaxAllowanceExpiration),
          nonce,
        };
      }),
    );
    console.log("details", details);

    const batch: Permit2Batch = {
      details,
      spender: BALANCER_BATCH_ROUTER[chainId],
      sigDeadline: MaxSigDeadline,
    };

    const { domain, types, values } = AllowanceTransfer.getPermitData(batch, PERMIT2[chainId], walletClient.chain.id);

    const signature = await walletClient.signTypedData({
      account: walletClient.account,
      message: {
        ...values,
      },
      domain,
      primaryType: "PermitBatch",
      types,
    });

    const permit2 = { batch, signature } as Permit2;
    console.log("permit2", permit2);

    const args = [[], [], permit2.batch, permit2.signature, [encodedSwapData]] as const;

    const hash = await writeTx(() => batchRouterContract.write.permitBatchAndCall(args), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Successfully multi swapped bitches!");
      },
    });

    console.log("txHash", hash);
  }

  return useMutation({ mutationFn: () => multiSwap() });
};

// ATTEMPT USING SDK BLOCKED BY SDK NOT ALLOWING MULTI SWAP PATHS

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
