import { useEffect } from "react";
import { BALANCER_ROUTER, InitPool, InitPoolDataProvider, InitPoolInput, balancerRouterAbi } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { getContract, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
// import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";
import { createPermit2 } from "~~/utils/permit2Helper";

export const useInitializePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  // const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.transport.transports[0].value.url;
  const protocolVersion = 3;
  const { poolAddress, poolType, tokenConfigs, updatePool, step } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  useEffect(() => {
    console.log("init pool useEffect");
  }, []);

  async function initializePool() {
    if (!poolAddress) throw new Error("Pool address missing");
    if (!rpcUrl) throw new Error("RPC URL missing");
    if (!chainId) throw new Error("Chain Id missing");
    if (!poolType) throw new Error("Pool type missing");
    if (!walletClient) throw new Error("Wallet client missing");

    const initPoolDataProvider = new InitPoolDataProvider(chainId, rpcUrl);
    const poolState = await initPoolDataProvider.getInitPoolData(poolAddress, poolType, protocolVersion);
    const initPool = new InitPool();

    // Make sure all tokenConfigs have decimals and address
    tokenConfigs.forEach(token => {
      if (token.tokenInfo?.decimals === null || token.address === "") {
        throw new Error(`Token ${token.address} is missing tokenInfo.decimals`);
      }
    });

    const amountsIn = tokenConfigs
      .map(token => {
        if (!token.tokenInfo?.decimals) throw new Error(`Token ${token.address} is missing tokenInfo.decimals`);
        const boostedToken = boostableWhitelist?.[token.address];
        const address = token.useBoostedVariant ? boostedToken?.address : token.address;
        const decimals = token.useBoostedVariant ? boostedToken?.decimals : token.tokenInfo?.decimals;
        if (!decimals) throw new Error(`Token ${token.address} is missing decimals`);
        return {
          address: address as `0x${string}`,
          rawAmount: parseUnits(token.amount, decimals),
          decimals,
        };
      })
      .sort((a, b) => a.address.localeCompare(b.address));

    const initPoolInput: InitPoolInput = {
      amountsIn,
      minBptAmountOut: 0n,
      chainId,
    };

    const { callData: encodedInitData } = initPool.buildCall(initPoolInput, poolState);

    // Setup permit2 stuffs for permitBatchAndCall
    const balancerRouterAddress = BALANCER_ROUTER[chainId];
    const client = { public: publicClient, wallet: walletClient };

    const { batch, signature } = await createPermit2({
      chainId,
      tokens: amountsIn.map(token => ({ address: token.address, amount: token.rawAmount })),
      client,
      spender: balancerRouterAddress,
    });

    const router = getContract({
      address: balancerRouterAddress,
      abi: balancerRouterAbi,
      client,
    });

    const args = [[], [], batch, signature, [encodedInitData]] as const;
    console.log("router.permitBatchAndCall args for initialize pool", args);

    // Execute the transaction
    const hash = await router.write.permitBatchAndCall(args);
    if (!hash) throw new Error("No pool initialization transaction hash");
    updatePool({ initPoolTxHash: hash });

    // Move the step forward if the transaction is successful
    const txReceipt = await publicClient.waitForTransactionReceipt({ hash });
    if (txReceipt.status === "success") {
      updatePool({ step: step + 1 });
    }

    return hash;
  }

  return useMutation({ mutationFn: () => initializePool() });
};
