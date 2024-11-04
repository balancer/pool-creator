import { PoolType, TokenType } from "@balancer/sdk";
import { isAddress } from "viem";
import { usePoolCreationStore, useValidateNetwork } from "~~/hooks/v3";

export function useValidatePoolCreationInput() {
  const { isWrongNetwork } = useValidateNetwork();

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
    if (!token.address || !token.amount) return false;

    // Must have rate provider if token type is TOKEN_WITH_RATE
    if (token.tokenType === TokenType.TOKEN_WITH_RATE && !isAddress(token.rateProvider)) return false;

    // If pool type is weighted, no token can have a weight of 0
    if (poolType === PoolType.Weighted && token.weight === 0) return false;

    return true;
  });

  const isParametersValid = [
    !!swapFeePercentage && Number(swapFeePercentage) > 0 && Number(swapFeePercentage) <= 10,
    poolType !== PoolType.Stable || !!amplificationParameter,
    isDelegatingManagement || (isAddress(swapFeeManager) && isAddress(pauseManager)),
    !isUsingHooks || isAddress(poolHooksContract),
  ].every(Boolean);

  const isInfoValid = !!name && !!symbol;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid };
}
