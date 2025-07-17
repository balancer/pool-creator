import {
  ChainId,
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

    // TODO: remove this and use call.to again after SDK update is released
    const isReClamm = input.poolType === PoolType.ReClamm;
    const to = isReClamm ? ReClammPoolFactory[input.chainId as keyof typeof ReClammPoolFactory] : call.to;

    const estimatedGas = await publicClient.estimateGas({
      account: walletClient.account,
      to,
      data: call.callData,
    });

    const hash = await writeTx(
      () =>
        walletClient.sendTransaction({
          account: walletClient.account,
          data: call.callData,
          to,
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
  const { poolType, amplificationParameter, eclpParams, reClammParams, tokenConfigs } = usePoolCreationStore();

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
    // if tokenConfigs "out of order", invert the min max and target price
    // TODO: account for if user is using boosted variant which means address will be underling so gotta look at other addy?
    const isTokenConfigsInOrder = tokenConfigs[0].address.toLowerCase() < tokenConfigs[1].address.toLowerCase();

    const { initialMinPrice, initialMaxPrice, initialTargetPrice } = reClammParams;

    // TODO: make re-usable invert function to share with handleInvertReClammParams
    let minPrice = Number(initialMinPrice);
    let maxPrice = Number(initialMaxPrice);
    let targetPrice = Number(initialTargetPrice);
    let tokenAPriceIncludesRate = reClammParams.tokenAPriceIncludesRate;
    let tokenBPriceIncludesRate = reClammParams.tokenBPriceIncludesRate;

    if (!isTokenConfigsInOrder) {
      minPrice = 1 / Number(initialMaxPrice);
      maxPrice = 1 / Number(initialMinPrice);
      targetPrice = 1 / Number(initialTargetPrice);
      tokenAPriceIncludesRate = reClammParams.tokenBPriceIncludesRate;
      tokenBPriceIncludesRate = reClammParams.tokenAPriceIncludesRate;
    }

    return {
      priceParams: {
        initialMinPrice: parseUnits(minPrice.toString(), 18),
        initialMaxPrice: parseUnits(maxPrice.toString(), 18),
        initialTargetPrice: parseUnits(targetPrice.toString(), 18),
        tokenAPriceIncludesRate,
        tokenBPriceIncludesRate,
      },
      priceShiftDailyRate: parseUnits(reClammParams.dailyPriceShiftExponent, 16), // SDK kept OG var name but on chain is same as creation ui
      centerednessMargin: parseUnits(reClammParams.centerednessMargin, 16), // Charting UX based on pool math simulator setup allows 0 - 100% but on chain is 0 - 50%
    };
  }

  return {};
}

const ReClammPoolFactory: Partial<Record<ChainId, `0x${string}`>> = {
  [ChainId.ARBITRUM_ONE]: "0x355bD33F0033066BB3DE396a6d069be57353AD95",
  [ChainId.AVALANCHE]: "0x309abcAeFa19CA6d34f0D8ff4a4103317c138657",
  [ChainId.BASE]: "0x201efd508c8DfE9DE1a13c2452863A78CB2a86Cc",
  [ChainId.GNOSIS_CHAIN]: "0xc86eF81E57492BE65BFCa9b0Ed53dCBAfDBe6100",
  [ChainId.HYPER_EVM]: "0x4BB42f71CAB7Bd13e9f958dA4351B9fa2d3A42FF",
  [ChainId.MAINNET]: "0xDaa273AeEc06e9CCb7428a77E2abb1E4659B16D2",
  [ChainId.OPTIMISM]: "0x891EC9B34829276a9a8ef2F8A9cEAF2486017e0d",
  [ChainId.SEPOLIA]: "0xf58A574530Ea5cEB727095e6039170c1e8068fcA",
  [ChainId.SONIC]: "0x99c13B259138a8ad8badbBfB87A4074591310De0",
};
