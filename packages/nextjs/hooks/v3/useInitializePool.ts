import {
  AllowanceTransfer,
  BALANCER_ROUTER,
  InitPool,
  InitPoolDataProvider,
  InitPoolInput,
  MaxAllowanceExpiration,
  MaxSigDeadline,
  PERMIT2,
  Permit2,
  Permit2Batch,
  PermitDetails,
  balancerRouterAbi,
  permit2Abi,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { getContract, parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useFetchBoostableTokens, usePoolCreationStore } from "~~/hooks/v3";

export const useInitializePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const protocolVersion = 3;
  const { poolAddress, poolType, tokenConfigs, updatePool, step } = usePoolCreationStore();
  const { standardToBoosted } = useFetchBoostableTokens();

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
        const boostedToken = standardToBoosted[token.address];
        const address = token.useBoostedVariant ? boostedToken.address : token.address;
        const decimals = token.useBoostedVariant ? boostedToken.decimals : token.tokenInfo?.decimals;

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
    const permit2Address = PERMIT2[chainId];
    const permit2Contract = getContract({
      address: permit2Address,
      abi: permit2Abi,
      client: { public: publicClient, wallet: walletClient },
    });

    const details: PermitDetails[] = await Promise.all(
      amountsIn.map(async token => {
        const [, , nonce] = await permit2Contract.read.allowance([
          walletClient.account.address,
          token.address,
          balancerRouterAddress,
        ]);

        return {
          token: token.address,
          amount: token.rawAmount,
          expiration: Number(MaxAllowanceExpiration),
          nonce,
        };
      }),
    );

    const batch: Permit2Batch = {
      details,
      spender: balancerRouterAddress,
      sigDeadline: MaxSigDeadline,
    };

    const { domain, types, values } = AllowanceTransfer.getPermitData(batch, permit2Address, walletClient.chain.id);

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

    const args = [[], [], permit2.batch, permit2.signature, [encodedInitData]] as const;
    console.log("router.permitBatchAndCall args for initialize pool", args);

    const router = getContract({
      address: balancerRouterAddress,
      abi: balancerRouterAbi,
      client: { public: publicClient, wallet: walletClient },
    });

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
