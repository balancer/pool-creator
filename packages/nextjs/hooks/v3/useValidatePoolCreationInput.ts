import { PoolType, TokenType } from "@balancer/sdk";
import { useQueryClient } from "@tanstack/react-query";
import { isAddress, parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { usePoolCreationStore, useValidateNetwork } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH } from "~~/utils/constants";

export function useValidatePoolCreationInput() {
  const { isWrongNetwork } = useValidateNetwork();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const {
    poolType,
    tokenConfigs,
    swapFeePercentage,
    name,
    symbol,
    amplificationParameter,
    isUsingHooks,
    isDelegatingManagement,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
  } = usePoolCreationStore();

  const isTypeValid = poolType !== undefined && !isWrongNetwork;

  const isTokensValid = tokenConfigs.every(token => {
    if (
      !token.address ||
      !token.amount ||
      !walletClient?.account.address ||
      !token.tokenInfo?.decimals ||
      Number(token.amount) <= 0
    )
      return false;

    // Look up cached user token balance using Wagmi's query key format
    const tokenBalanceQueryKey = [
      "readContract",
      {
        address: token.address,
        functionName: "balanceOf",
        args: [walletClient?.account.address],
        chainId: walletClient?.chain.id,
      },
    ];
    const rawUserBalance: bigint = queryClient.getQueryData(tokenBalanceQueryKey) ?? 0n;
    const rawTokenAmount = parseUnits(token.amount, token.tokenInfo.decimals);

    // User must have enough token balance
    if (rawTokenAmount > rawUserBalance) return false;

    // If pool type is weighted, no token can have a weight of 0
    if (poolType === PoolType.Weighted && token.weight === 0) return false;

    // Must have rate provider if token type is TOKEN_WITH_RATE
    if (token.tokenType === TokenType.TOKEN_WITH_RATE && !isAddress(token.rateProvider)) return false;

    // Check tanstack query cache for rate provider validity
    if (token.tokenType === TokenType.TOKEN_WITH_RATE) {
      const isValidRateProvider = queryClient.getQueryData(["validateRateProvider", token.rateProvider]) ?? false;
      if (!isValidRateProvider) return false;
    }
    return true;
  });

  // Check tanstack query cache for pool hooks contract validity
  const isValidPoolHooksContract = queryClient.getQueryData(["validatePoolHooks", poolHooksContract]) ?? false;

  const isParametersValid = [
    !!swapFeePercentage && Number(swapFeePercentage) > 0 && Number(swapFeePercentage) <= 10,
    poolType !== PoolType.Stable ||
      (!!amplificationParameter && Number(amplificationParameter) >= 1 && Number(amplificationParameter) <= 5000),
    isDelegatingManagement || (isAddress(swapFeeManager) && isAddress(pauseManager)),
    !isUsingHooks || isValidPoolHooksContract,
  ].every(Boolean);

  const isInfoValid = !!name && !!symbol && name.length <= MAX_POOL_NAME_LENGTH;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid };
}
