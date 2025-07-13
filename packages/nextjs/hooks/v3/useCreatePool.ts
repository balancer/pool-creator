import {
  CreatePool,
  CreatePoolGyroECLPInput,
  CreatePoolReClammInput,
  CreatePoolStableSurgeInput,
  CreatePoolV3BaseInput,
  CreatePoolV3StableInput,
  CreatePoolV3WeightedInput,
  PoolType,
  gyroECLPPoolFactoryAbiExtended,
  stablePoolFactoryAbiExtended,
  stableSurgeFactoryAbiExtended,
  weightedPoolFactoryAbiExtended_V3,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useHyperLiquid } from "~~/hooks/hyperliquid";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { useBoostableWhitelist, usePoolCreationStore } from "~~/hooks/v3";

type SupportedPoolTypeInputs =
  | CreatePoolV3StableInput
  | CreatePoolStableSurgeInput
  | CreatePoolV3WeightedInput
  | CreatePoolGyroECLPInput
  | CreatePoolReClammInput;

export const poolFactoryAbi = {
  [PoolType.Weighted]: weightedPoolFactoryAbiExtended_V3,
  [PoolType.Stable]: stablePoolFactoryAbiExtended,
  [PoolType.StableSurge]: stableSurgeFactoryAbiExtended,
  [PoolType.GyroE]: gyroECLPPoolFactoryAbiExtended,
  [PoolType.ReClamm]: gyroECLPPoolFactoryAbiExtended,
};

const SWAP_FEE_PERCENTAGE_DECIMALS = 16;
const TOKEN_WEIGHT_DECIMALS = 16;

export const useCreatePool = () => {
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const writeTx = useTransactor();

  const poolTypeSpecificParams = usePoolTypeSpecificParams();
  const { data: boostableWhitelist } = useBoostableWhitelist();
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
    updatePool,
    createPoolTx,
  } = usePoolCreationStore();

  const { bigBlockGasPrice, isHyperEvm } = useHyperLiquid();

  function createPoolInput() {
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
        // Handle case where only weighted pools have 'weight' property as part of token config
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

    return {
      ...baseInput,
      ...poolTypeSpecificParams,
      poolType,
    } as SupportedPoolTypeInputs;
  }

  async function createPool() {
    if (!publicClient) throw new Error("Public client must be available!");
    if (!walletClient) throw new Error("Wallet client must be connected!");
    if (poolType === undefined) throw new Error("No pool type provided!");

    const createPool = new CreatePool();
    const input = createPoolInput();
    const call = createPool.buildCall(input);

    const estimatedGas = await publicClient.estimateGas({
      account: walletClient.account,
      to: call.to,
      data: call.callData,
    });

    const hash = await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to: call.to,
          gas: isHyperEvm ? estimatedGas * 2n : undefined,
          gasPrice: isHyperEvm && bigBlockGasPrice ? BigInt(bigBlockGasPrice) : undefined,
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

// Returns pool type specific parameters necesary for the create pool input
function usePoolTypeSpecificParams() {
  const { poolType, amplificationParameter, eclpParams, reClammParams } = usePoolCreationStore();

  const isGyroEclp = poolType === PoolType.GyroE;
  const isStablePool = poolType === PoolType.Stable || poolType === PoolType.StableSurge;
  const isReClamm = poolType === PoolType.ReClamm;

  if (isStablePool) return { amplificationParameter: BigInt(amplificationParameter) };

  if (isGyroEclp) {
    const { alpha, beta, c, s, lambda, usdPerTokenInput0, usdPerTokenInput1 } = eclpParams;

    if (!alpha || !beta || !c || !s || !lambda || !usdPerTokenInput0 || !usdPerTokenInput1) return;

    return {
      eclpParams: {
        alpha: parseUnits(alpha, 18),
        beta: parseUnits(beta, 18),
        c: parseUnits(c, 18),
        s: parseUnits(s, 18),
        lambda: parseUnits(lambda, 18),
      },
    };
  }

  if (isReClamm) {
    return {
      priceParams: {
        initialMinPrice: parseUnits(reClammParams.initialMinPrice, 18),
        initialMaxPrice: parseUnits(reClammParams.initialMaxPrice, 18),
        initialTargetPrice: parseUnits(reClammParams.initialTargetPrice, 18),
        tokenAPriceIncludesRate: reClammParams.tokenAPriceIncludesRate,
        tokenBPriceIncludesRate: reClammParams.tokenBPriceIncludesRate,
      },
      priceShiftDailyRate: parseUnits(reClammParams.dailyPriceShiftExponent, 16), // SDK kept OG var name but on chain is same as creation ui
      centerednessMargin: parseUnits((Number(reClammParams.centerednessMargin) / 2).toString(), 16), // Charting UX based on pool math simulator setup allows 0 - 100% but on chain is 0 - 50%
    };
  }

  return {};
}
