import { PoolType, STABLE_POOL_CONSTRAINTS, TokenType } from "@balancer/sdk";
import { isAddress, parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { useEclpParamValidations } from "~~/hooks/gyro";
import { usePoolCreationStore, useUserDataStore, useValidateHooksContract } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from "~~/utils/constants";

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
    eclpParams,
  } = usePoolCreationStore();

  const { baseParamsError, derivedParamsError } = useEclpParamValidations(eclpParams);

  const isTypeValid = poolType !== undefined;

  const isValidTokenWeights =
    poolType !== PoolType.Weighted ||
    (tokenConfigs.every(token => (token?.weight ?? 0) > 0) &&
      tokenConfigs.reduce((acc, token) => acc + (token?.weight ?? 0), 0) === 100);

  const isTokensValid = tokenConfigs.every(token => {
    if (!token.address || !token.tokenInfo?.decimals) return false;

    // Must have rate provider if token type is TOKEN_WITH_RATE
    if (token.tokenType === TokenType.TOKEN_WITH_RATE && !isAddress(token.rateProvider)) return false;

    // Check tanstack query cache for rate provider validity
    if (token.tokenType === TokenType.TOKEN_WITH_RATE) {
      if (!token.isValidRateProvider) return false;
    }
    return true;
  });

  const isTokenAmountsValid = tokenConfigs.every(token => {
    if (!token.amount || !walletClient?.account.address || Number(token.amount) <= 0 || !token.tokenInfo?.decimals)
      return false;

    const rawUserBalance: bigint = userTokenBalances[token.address] ? BigInt(userTokenBalances[token.address]) : 0n;

    const rawTokenAmount = parseUnits(token.amount, token.tokenInfo.decimals);

    // User must have enough token balance
    if (rawTokenAmount > rawUserBalance) return false;

    return true;
  });

  // Check tanstack query cache for pool hooks contract validity
  const { data: isValidPoolHooksContract } = useValidateHooksContract(isUsingHooks, poolHooksContract);

  const isParametersValid = [
    !!swapFeePercentage && Number(swapFeePercentage) > 0 && Number(swapFeePercentage) <= 10,
    // Stable and StableSurge require valid amplification parameter
    (poolType !== PoolType.Stable && poolType !== PoolType.StableSurge) ||
      (!!amplificationParameter &&
        Number(amplificationParameter) >= STABLE_POOL_CONSTRAINTS.MIN_AMP &&
        Number(amplificationParameter) <= STABLE_POOL_CONSTRAINTS.MAX_AMP),
    // GyroE type requires special validations for eclp params
    poolType !== PoolType.GyroE || (!baseParamsError && !derivedParamsError),
    isDelegatingSwapFeeManagement || isAddress(swapFeeManager),
    isDelegatingPauseManagement || isAddress(pauseManager),
    !isUsingHooks || isValidPoolHooksContract,
  ].every(Boolean);

  // TODO: Make info tab validatiosn less sloppy? (temporarily combining weighted and token amount validations with info)
  const isInfoValid =
    !!name &&
    !!symbol &&
    name.length <= MAX_POOL_NAME_LENGTH &&
    symbol.length <= MAX_POOL_SYMBOL_LENGTH &&
    isValidTokenWeights &&
    (poolType !== PoolType.Weighted || hasAgreedToWarning) &&
    isTokenAmountsValid;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid, isValidTokenWeights };
}
