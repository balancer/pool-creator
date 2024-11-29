import {
  BALANCER_ROUTER,
  InitPool,
  InitPoolInput,
  PoolState,
  VAULT_V3,
  balancerRouterAbi,
  vaultExtensionAbi_V3,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { Address, getContract, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";
import { createPermit2 } from "~~/utils/permit2Helper";

export const useInitializePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const protocolVersion = 3;
  const { poolAddress, poolType, tokenConfigs, updatePool, step } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  async function initializePool() {
    if (!poolAddress) throw new Error("Pool address missing");
    if (!rpcUrl) throw new Error("RPC URL missing");
    if (!chainId) throw new Error("Chain Id missing");
    if (!poolType) throw new Error("Pool type missing");
    if (!walletClient) throw new Error("Wallet client missing");

    // const initPoolDataProvider = new InitPoolDataProvider(chainId, rpcUrl);
    // const poolState = await initPoolDataProvider.getInitPoolData(poolAddress, poolType, protocolVersion);

    // TEMPORARILY MANUAL FETCH OF POOLSTATE
    const vaultV3 = getContract({
      abi: vaultExtensionAbi_V3,
      address: VAULT_V3[chainId],
      client: publicClient,
    });
    const poolTokens = (await vaultV3.read.getPoolTokens([poolAddress])) as Address[];

    const tokens = poolTokens.map((token, idx) => {
      const tokenConfig = tokenConfigs.find(t => {
        const tokenConfigAddress = t.useBoostedVariant ? boostableWhitelist?.[t.address]?.address : t.address;
        if (!tokenConfigAddress) throw new Error(`Problem with boosted variant for ${t.address}`);
        return tokenConfigAddress.toLowerCase() === token.toLowerCase();
      });
      const decimals = tokenConfig?.tokenInfo?.decimals;
      if (!decimals)
        throw new Error(
          `Missing decimals for token ${token}. Available tokens: ${tokenConfigs.map(t => t.address).join(", ")}`,
        );
      return {
        address: token as `0x${string}`,
        decimals,
        index: idx,
      };
    });

    const poolState: PoolState = {
      id: poolAddress as `0x${string}`,
      address: poolAddress as `0x${string}`,
      type: poolType,
      tokens,
      protocolVersion,
    };
    // END TEMPORARY MANUAL FETCH OF POOLSTATE

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
    const hash = await writeTx(() => router.write.permitBatchAndCall(args), {
      blockConfirmations: 1,
      onBlockConfirmation: () => {
        console.log("Successfully initialized pool!", poolAddress);
      },
    });
    if (!hash) throw new Error("No pool initialization transaction hash");

    updatePool({ step: step + 1, initPoolTxHash: hash });
    return hash;
  }

  return useMutation({ mutationFn: () => initializePool() });
};
