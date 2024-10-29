import { InitPool, InitPoolDataProvider, InitPoolInput } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits } from "viem";
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

    console.log("poolState for initializePool", poolState);
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

    console.log("amountsIn for initializePool", amountsIn);

    const input: InitPoolInput = {
      amountsIn,
      minBptAmountOut: 0n,
      chainId,
    };

    const call = initPool.buildCall(input, poolState);

    const hash = await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to: call.to,
        }),
      {
        blockConfirmations: 1,
        onBlockConfirmation: () => {
          console.log("Successfully initialized pool!", poolAddress);
        },
      },
    );
    if (!hash) throw new Error("No pool initialization transaction hash");
    updatePool({ step: step + 1, initPoolTxHash: hash });
    return hash;
  }

  return useMutation({ mutationFn: () => initializePool() });
};
