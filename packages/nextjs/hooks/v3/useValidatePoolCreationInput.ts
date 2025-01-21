import { PoolType, TokenType } from "@balancer/sdk";
import { isAddress, parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { usePoolCreationStore, useUserDataStore, useValidateHooksContract } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH } from "~~/utils/constants";

export function useValidatePoolCreationInput() {
  const { data: walletClient } = useWalletClient();
  const { userTokenBalances, hasAgreedToWarning } = useUserDataStore();

  const {
    poolType,
    tokenConfigs,
    swapFeePercentage,
    name,
    symbol,
    amplificationParameter,
    isUsingHooks,
    isDelegatingSwapFeeManagement,
    isDelegatingPauseManagement,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
  } = usePoolCreationStore();

  const isTypeValid = poolType !== undefined;

  const isValidTokenWeights =
    poolType !== PoolType.Weighted ||
    (tokenConfigs.every(token => token.weight > 0) &&
      tokenConfigs.reduce((acc, token) => acc + token.weight, 0) === 100);

  const isTokensValid =
    tokenConfigs.every(token => {
      if (
        !token.address ||
        !token.amount ||
        !walletClient?.account.address ||
        !token.tokenInfo?.decimals ||
        Number(token.amount) <= 0
      )
        return false;

      const rawUserBalance: bigint = userTokenBalances[token.address] ? BigInt(userTokenBalances[token.address]) : 0n;

      const rawTokenAmount = parseUnits(token.amount, token.tokenInfo.decimals);

      // User must have enough token balance
      if (rawTokenAmount > rawUserBalance) return false;

      // If pool type is weighted, no token can have a weight of 0
      if (poolType === PoolType.Weighted && token.weight === 0) return false;

      // Must have rate provider if token type is TOKEN_WITH_RATE
      if (token.tokenType === TokenType.TOKEN_WITH_RATE && !isAddress(token.rateProvider)) return false;

      // Check tanstack query cache for rate provider validity
      if (token.tokenType === TokenType.TOKEN_WITH_RATE) {
        if (!token.isValidRateProvider) return false;
      }
      return true;
    }) &&
    isValidTokenWeights &&
    (poolType !== PoolType.Weighted || hasAgreedToWarning);

  // Check tanstack query cache for pool hooks contract validity
  const { data: isValidPoolHooksContract } = useValidateHooksContract(isUsingHooks, poolHooksContract);

  const isParametersValid = [
    !!swapFeePercentage && Number(swapFeePercentage) > 0 && Number(swapFeePercentage) <= 10,
    poolType !== PoolType.Stable ||
      (!!amplificationParameter && Number(amplificationParameter) >= 1 && Number(amplificationParameter) <= 5000),
    isDelegatingSwapFeeManagement || isAddress(swapFeeManager),
    isDelegatingPauseManagement || isAddress(pauseManager),
    !isUsingHooks || isValidPoolHooksContract,
  ].every(Boolean);

  const isInfoValid = !!name && !!symbol && name.length <= MAX_POOL_NAME_LENGTH;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid, isValidTokenWeights };
}
