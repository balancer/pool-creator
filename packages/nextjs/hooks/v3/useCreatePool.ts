import {
  CreatePool,
  CreatePoolV3BaseInput,
  CreatePoolV3StableInput,
  CreatePoolV3WeightedInput,
  PoolType,
} from "@balancer/sdk";
import { useMutation } from "@tanstack/react-query";
import { parseUnits, zeroAddress } from "viem";
import { usePublicClient, useWalletClient } from "wagmi";
import { useTransactor } from "~~/hooks/scaffold-eth";
import { usePoolCreationStore } from "~~/hooks/v3";

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
  } = usePoolCreationStore();

  function createPoolInput(poolType: PoolType): CreatePoolV3StableInput | CreatePoolV3WeightedInput {
    if (poolType === undefined) throw new Error("No pool type provided!");
    const baseInput: CreatePoolV3BaseInput = {
      chainId: 11155111,
      protocolVersion: 3,
      name,
      symbol,
      swapFeePercentage: parseUnits(swapFeePercentage, 16),
      swapFeeManager,
      pauseManager,
      poolHooksContract: poolHooksContract === "" ? zeroAddress : poolHooksContract,
      enableDonation,
      disableUnbalancedLiquidity,
    };

    if (poolType === PoolType.Weighted) {
      return {
        ...baseInput,
        poolType: PoolType.Weighted,
        tokens: tokenConfigs.map(({ address, weight, rateProvider, tokenType, paysYieldFees }) => ({
          address,
          rateProvider,
          tokenType,
          paysYieldFees,
          weight: parseUnits(weight.toString(), 16),
        })),
      } as CreatePoolV3WeightedInput;
    } else {
      return {
        ...baseInput,
        poolType: PoolType.Stable,
        amplificationParameter: BigInt(amplificationParameter),
        tokens: tokenConfigs.map(({ address, rateProvider, tokenType, paysYieldFees }) => ({
          address,
          rateProvider,
          tokenType,
          paysYieldFees,
        })),
      } as CreatePoolV3StableInput;
    }
  }

  async function createPool() {
    if (!publicClient) throw new Error("Public client must be available!");
    if (!walletClient) throw new Error("Wallet client must be connected!");
    if (poolType === undefined) throw new Error("No pool type provided!");

    const createPool = new CreatePool();
    const input = createPoolInput(poolType);
    const call = createPool.buildCall(input);

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
          console.log("Successfully deployed and registered a balancer v3 pool!");
        },
      },
    );
  }

  return useMutation({ mutationFn: () => createPool() });
};
