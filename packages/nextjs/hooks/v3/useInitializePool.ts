import { InitPool, InitPoolDataProvider, InitPoolInput, Permit2Helper } from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits, publicActions } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";

/**
 * Handles sending the init pool transaction
 */
export const useInitializePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();
  const chainId = publicClient?.chain.id;
  const rpcUrl = publicClient?.transport.transports[0].value.url;
  const protocolVersion = 3;
  const { poolAddress, poolType, tokenConfigs, updatePool, initPoolTx } = usePoolCreationStore();
  const { data: boostableWhitelist } = useBoostableWhitelist();

  async function initializePool() {
    if (!poolAddress) throw new Error("Pool address missing");
    if (!rpcUrl) throw new Error("RPC URL missing");
    if (!chainId) throw new Error("Chain Id missing");
    if (!poolType) throw new Error("Pool type missing");
    if (!walletClient) throw new Error("Wallet client missing");
    if (!walletClient.account) throw new Error("Wallet account missing");

    // Build init pool input using pool creation store
    const amountsIn = tokenConfigs
      .map(token => {
        if (!token.address) throw new Error(`Token is missing address`);
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

    // Fetch the necessary pool state
    const initPoolDataProvider = new InitPoolDataProvider(chainId, rpcUrl);
    const poolState = await initPoolDataProvider.getInitPoolData(poolAddress, poolType, protocolVersion);

    const permit2 = await Permit2Helper.signInitPoolApproval({
      ...initPoolInput,
      client: walletClient.extend(publicActions),
      owner: walletClient.account.address,
    });

    const initPool = new InitPool();
    const call = initPool.buildCallWithPermit2(initPoolInput, poolState, permit2);
    console.log("initPool call:", call);

    const hash = await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to: call.to,
        }),
      {
        // callbacks to save tx hash's to store
        onSafeTxHash: safeHash => updatePool({ initPoolTx: { ...initPoolTx, safeHash } }),
        onWagmiTxHash: wagmiHash => updatePool({ initPoolTx: { ...initPoolTx, wagmiHash } }),
      },
    );
    if (!hash) throw new Error("Missing init pool transaction hash");

    return hash;
  }

  return useMutation({
    mutationFn: () => initializePool(),
    onError: error => {
      console.error(error);
    },
  });
};
