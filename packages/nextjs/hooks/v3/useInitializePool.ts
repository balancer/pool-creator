import { InitPool, InitPoolDataProvider, InitPoolInput } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { usePoolCreationStore } from "~~/hooks/v3";

export const useInitializePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.chain.rpcUrls.default.http[0];
  const protocolVersion = 3;
  const { poolAddress, poolType, tokenConfigs } = usePoolCreationStore();

  async function initializePool() {
    if (!poolAddress) throw new Error("Pool address missing");
    if (!rpcUrl) throw new Error("RPC URL missing");
    if (!chainId) throw new Error("Chain Id missing");
    if (!poolType) throw new Error("Pool type missing");
    if (!walletClient) throw new Error("Wallet client missing");

    const initPoolDataProvider = new InitPoolDataProvider(chainId, rpcUrl);

    const poolState = await initPoolDataProvider.getInitPoolData(poolAddress, poolType, protocolVersion);

    const initPool = new InitPool();

    const amountsIn = tokenConfigs
      .map(token => ({
        address: token.address as `0x${string}`,
        rawAmount: parseUnits(token.amount, token.tokenInfo?.decimals || 18),
        decimals: token.tokenInfo?.decimals || 18,
      }))
      .sort((a, b) => a.address.localeCompare(b.address));

    const input: InitPoolInput = {
      amountsIn,
      minBptAmountOut: parseUnits("0", 18), // TODO: what should this be?
      chainId,
    };

    const call = initPool.buildCall(input, poolState);

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
          console.log("Successfully initialized pool!", poolAddress);
        },
      },
    );
  }

  return useMutation({ mutationFn: () => initializePool() });
};
