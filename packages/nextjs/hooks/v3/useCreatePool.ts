import {
  CreatePool,
  CreatePoolV3BaseInput,
  CreatePoolV3StableInput,
  CreatePoolV3WeightedInput,
  PoolType,
  stablePoolFactoryAbi_V3,
  weightedPoolFactoryAbi_V3,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";

export const poolFactoryAbi = {
  [PoolType.Weighted]: weightedPoolFactoryAbi_V3,
  [PoolType.Stable]: stablePoolFactoryAbi_V3,
};

const SWAP_FEE_PERCENTAGE_DECIMALS = 16;
const TOKEN_WEIGHT_DECIMALS = 16;

export const useCreatePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();

  const {
    tokenConfigs,
    name,
    symbol,
    poolType,
    swapFeePercentage,
    pauseManager,
    poolHooksContract,
    swapFeeManager,
    enableDonation,
    disableUnbalancedLiquidity,
    amplificationParameter,
    updatePool,
  } = usePoolCreationStore();

  const { data: boostableWhitelist } = useBoostableWhitelist();

  function createPoolInput(poolType: PoolType): CreatePoolV3StableInput | CreatePoolV3WeightedInput {
    if (poolType === undefined) throw new Error("No pool type provided!");
    if (!publicClient) throw new Error("Public client must be available!");
    const baseInput: CreatePoolV3BaseInput = {
      chainId: publicClient.chain.id,
      protocolVersion: 3,
      name,
      symbol,
      swapFeePercentage: parseUnits(swapFeePercentage, SWAP_FEE_PERCENTAGE_DECIMALS),
      swapFeeManager: swapFeeManager === "" ? zeroAddress : swapFeeManager,
      pauseManager: pauseManager === "" ? zeroAddress : pauseManager,
      poolHooksContract: poolHooksContract === "" ? zeroAddress : poolHooksContract,
      enableDonation,
      disableUnbalancedLiquidity,
    };

    // Conditionally creates pool with boosted variant addresses if useBoostedVariant is true
    const tokens = tokenConfigs.map(
      ({ address, weight, rateProvider, tokenType, paysYieldFees, useBoostedVariant }) => {
        const boostedVariant = boostableWhitelist?.[address];
        const tokenAddress = useBoostedVariant && boostedVariant ? boostedVariant.address : address;
        return {
          address: tokenAddress,
          rateProvider,
          tokenType,
          paysYieldFees,
          ...(poolType === PoolType.Weighted && { weight: parseUnits(weight.toString(), TOKEN_WEIGHT_DECIMALS) }),
        };
      },
    );

    return {
      ...baseInput,
      poolType,
      tokens,
      ...(poolType === PoolType.Stable && { amplificationParameter: BigInt(amplificationParameter) }),
    } as CreatePoolV3StableInput | CreatePoolV3WeightedInput;
  }

  async function createPool() {
    if (!publicClient) throw new Error("Public client must be available!");
    if (!walletClient) throw new Error("Wallet client must be connected!");
    if (poolType === undefined) throw new Error("No pool type provided!");

    const createPool = new CreatePool();
    const input = createPoolInput(poolType);
    const call = createPool.buildCall(input);

    const hash = await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to: call.to,
        }),
      {
        // I think it's safe to make safeHash undefined once wagmiHash is available
        onTransactionHash: txHash => updatePool({ createPoolTx: { wagmiHash: txHash, safeHash: undefined } }),
      },
    );

    return hash;
  }

  return useMutation({ mutationFn: () => createPool() });
};