import { PoolType, STABLE_POOL_CONSTRAINTS, TokenType } from "@balancer/sdk";
import { isAddress } from "viem";
import { useEclpParamValidations } from "~~/hooks/gyro";
import { usePoolCreationStore, useValidateHooksContract } from "~~/hooks/v3";
import { MAX_POOL_NAME_LENGTH, MAX_POOL_SYMBOL_LENGTH } from "~~/utils/constants";

export function useValidateCreationInputs() {
  const {
    poolType,
    tokenConfigs,
    swapFeePercentage,
    name,
    symbol,
    amplificationParameter,
    isDelegatingSwapFeeManagement,
    isDelegatingPauseManagement,
    swapFeeManager,
    pauseManager,
    poolHooksContract,
    eclpParams,
    reClammParams,
  } = usePoolCreationStore();

  const { baseParamsError, derivedParamsError } = useEclpParamValidations(eclpParams);

  const isTypeValid = poolType !== undefined;

  const isValidTokenWeights =
    poolType !== PoolType.Weighted ||
    (tokenConfigs.every(token => Number(token.weight) > 0) &&
      tokenConfigs.reduce((acc, token) => acc + Number(token.weight), 0) === 100);

  const isTokensValid =
    tokenConfigs.every(token => {
      if (!token.address || !token.tokenInfo?.decimals) return false;

      // Must have rate provider if token type is TOKEN_WITH_RATE
      if (token.tokenType === TokenType.TOKEN_WITH_RATE && !isAddress(token.rateProvider)) return false;

      return true;
    }) && isValidTokenWeights;

  // Check tanstack query cache for pool hooks contract validity
  const { isValidPoolHooksContract } = useValidateHooksContract(poolHooksContract);

  const isGyroEclpParamsValid = !baseParamsError && !derivedParamsError;

  const isDailyPriceShiftExponentValid =
    Number(reClammParams.dailyPriceShiftExponent) >= 0 && Number(reClammParams.dailyPriceShiftExponent) <= 100;
  const isCenterednessMarginValid =
    Number(reClammParams.centerednessMargin) >= 0 && Number(reClammParams.centerednessMargin) <= 90;
  const isReClammParamsValid =
    Object.values(reClammParams).every(value => value !== "") &&
    isDailyPriceShiftExponentValid &&
    isCenterednessMarginValid;

  const isParametersValid = [
    // Common param checks for all pool types
    !!swapFeePercentage && Number(swapFeePercentage) > 0 && Number(swapFeePercentage) <= 10,
    isDelegatingSwapFeeManagement || isAddress(swapFeeManager),
    isDelegatingPauseManagement || isAddress(pauseManager),
    isValidPoolHooksContract,
    // Stable and StableSurge require valid amplification parameter
    (poolType !== PoolType.Stable && poolType !== PoolType.StableSurge) ||
      (!!amplificationParameter &&
        Number(amplificationParameter) >= STABLE_POOL_CONSTRAINTS.MIN_AMP &&
        Number(amplificationParameter) <= STABLE_POOL_CONSTRAINTS.MAX_AMP),
    // GyroE type requires special validations
    poolType !== PoolType.GyroE || isGyroEclpParamsValid,
    // ReClamm type requires special validations
    poolType !== PoolType.ReClamm || isReClammParamsValid,
  ].every(Boolean);

  // TODO: Make info tab validatiosn less sloppy? (temporarily combining weighted and token amount validations with info)
  const isInfoValid =
    !!name &&
    !!symbol &&
    name.length <= MAX_POOL_NAME_LENGTH &&
    symbol.length <= MAX_POOL_SYMBOL_LENGTH &&
    isValidTokenWeights;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid, isValidTokenWeights };
}
