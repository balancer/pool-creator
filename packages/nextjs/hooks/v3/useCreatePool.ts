import {
  CreatePool,
  CreatePoolGyroECLPInput,
  CreatePoolStableSurgeInput,
  CreatePoolV3BaseInput,
  CreatePoolV3StableInput,
  CreatePoolV3WeightedInput,
  PoolType,
  calcDerivedParams,
  gyroECLPPoolFactoryAbiExtended,
  stablePoolFactoryAbiExtended,
  stableSurgeFactoryAbiExtended,
  weightedPoolFactoryAbiExtended_V3,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";
import { getParsedEclpParams } from "~~/utils/gryo/helpers";

export const poolFactoryAbi = {
  [PoolType.Weighted]: weightedPoolFactoryAbiExtended_V3,
  [PoolType.Stable]: stablePoolFactoryAbiExtended,
  [PoolType.StableSurge]: stableSurgeFactoryAbiExtended,
  [PoolType.GyroE]: gyroECLPPoolFactoryAbiExtended,
  [PoolType.ReClamm]: gyroECLPPoolFactoryAbiExtended,
};

const SWAP_FEE_PERCENTAGE_DECIMALS = 16;
const TOKEN_WEIGHT_DECIMALS = 16;

/**
 * Handles sending the create pool transaction
 */
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
    createPoolTx,
    eclpParams,
  } = usePoolCreationStore();

  const { data: boostableWhitelist } = useBoostableWhitelist();
  function createPoolInput(
    poolType: PoolType,
  ): CreatePoolV3StableInput | CreatePoolV3WeightedInput | CreatePoolStableSurgeInput | CreatePoolGyroECLPInput {
    if (poolType === undefined) throw new Error("No pool type provided!");
    if (!publicClient) throw new Error("Public client must be available!");

    const baseInput: CreatePoolV3BaseInput = {
      chainId: publicClient.chain.id,
      protocolVersion: 3,
      name,
      symbol,
      swapFeePercentage: parseUnits(swapFeePercentage, SWAP_FEE_PERCENTAGE_DECIMALS),
      swapFeeManager: swapFeeManager ? swapFeeManager : zeroAddress,
      pauseManager: pauseManager ? pauseManager : zeroAddress,
      poolHooksContract: poolHooksContract ? poolHooksContract : zeroAddress,
      enableDonation,
      disableUnbalancedLiquidity,
      tokens: tokenConfigs.map(({ address, weight, rateProvider, tokenType, paysYieldFees, useBoostedVariant }) => {
        // Conditionally creates pool with boosted variant addresses if useBoostedVariant is true
        const boostedVariant = boostableWhitelist?.[address];
        const tokenAddress = useBoostedVariant && boostedVariant ? boostedVariant.address : address;
        if (poolType === PoolType.Weighted && !weight) throw new Error("Weight is required for each token");
        return {
          address: tokenAddress,
          rateProvider,
          tokenType,
          paysYieldFees,
          ...(poolType === PoolType.Weighted &&
            weight !== undefined && { weight: parseUnits(weight.toString(), TOKEN_WEIGHT_DECIMALS) }),
        };
      }),
    };

    const parsedEclpParams = getParsedEclpParams(eclpParams);

    return {
      ...baseInput,
      poolType,
      ...((poolType === PoolType.Stable || poolType === PoolType.StableSurge) && {
        amplificationParameter: BigInt(amplificationParameter),
      }),
      ...(poolType === PoolType.GyroE && {
        eclpParams: parsedEclpParams,
        derivedEclpParams: calcDerivedParams(parsedEclpParams),
      }),
    } as CreatePoolV3StableInput | CreatePoolV3WeightedInput | CreatePoolStableSurgeInput | CreatePoolGyroECLPInput;
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
        // callbacks to save tx hash's to store
        onSafeTxHash: safeHash => updatePool({ createPoolTx: { ...createPoolTx, safeHash } }),
        onWagmiTxHash: wagmiHash => updatePool({ createPoolTx: { ...createPoolTx, wagmiHash } }),
      },
    );

    return hash;
  }

  return useMutation({
    mutationFn: () => createPool(),
    onError: error => {
      console.error(error);
    },
  });
};
