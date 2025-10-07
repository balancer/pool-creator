import { PoolType } from "@balancer/sdk";
import { parseUnits } from "viem";
import { useWalletClient } from "wagmi";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";

export const useValidateInitializationInputs = () => {
  const { tokenConfigs, poolType } = usePoolCreationStore();
  const { data: walletClient } = useWalletClient();
  const { userTokenBalances, hasAgreedToWarning } = useUserDataStore();

  const isTokenAmountsValid =
    tokenConfigs.every(token => {
      if (
        token.amount === "" ||
        !walletClient?.account.address ||
        Number(token.amount) < 0 ||
        !token.tokenInfo?.decimals
      )
        return false;

      const rawUserBalance: bigint = userTokenBalances[token.address] ? BigInt(userTokenBalances[token.address]) : 0n;

      const rawTokenInput = parseUnits(token.amount, token.tokenInfo.decimals);

      // User must have enough token balance
      if (rawTokenInput > rawUserBalance) return false;

      return true;
    }) && tokenConfigs.some(token => Number(token.amount) > 0);

  const hasAgreedToWeightedsWarning = poolType !== PoolType.Weighted || hasAgreedToWarning;

  const isInitializePoolInputsValid = isTokenAmountsValid && hasAgreedToWeightedsWarning;

  return { isInitializePoolInputsValid };
};
