import { PoolType } from "@balancer/sdk";
import { usePoolCreationStore } from "~~/hooks/v3";

export function useValidatePoolCreationInput() {
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

  const isTypeValid = poolType !== undefined;

  const isTokensValid = tokenConfigs.every(token => token.address && token.amount);

  const isParametersValid = !!(
    swapFeePercentage &&
    (poolType !== PoolType.Stable || amplificationParameter) &&
    (isDelegatingManagement || (swapFeeManager && pauseManager)) &&
    (!isUsingHooks || poolHooksContract)
  );

  const isInfoValid = !!name && !!symbol;

  const isPoolCreationInputValid = isTypeValid && isTokensValid && isParametersValid && isInfoValid;

  return { isParametersValid, isTypeValid, isInfoValid, isTokensValid, isPoolCreationInputValid };
}
