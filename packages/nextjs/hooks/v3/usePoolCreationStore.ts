import { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TokenType } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { create } from "zustand";
import { type Token } from "~~/hooks/token";

export type AllowedPoolTypes = PoolType.Stable | PoolType.Weighted;

export type TokenConfig = {
  address: Address;
  rateProvider: Address;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: number;
  tokenInfo: Token | null;
  amount: string; // human readable
};

interface PoolStore {
  step: number;
  isDelegatingManagement: boolean;
  isUsingHooks: boolean;
  poolAddress: Address | undefined;
  poolType: AllowedPoolTypes | undefined;
  tokenConfigs: TokenConfig[];
  name: string;
  symbol: string;
  swapFeePercentage: string;
  swapFeeManager: Address;
  pauseManager: Address;
  poolHooksContract: Address;
  disableUnbalancedLiquidity: boolean;
  enableDonation: boolean;
  amplificationParameter: string;
  setStep: (step: number) => void;
  setIsDelegatingManagement: (isDelegatingManagement: boolean) => void;
  setIsUsingHooks: (isUsingHooks: boolean) => void;
  setPoolAddress: (poolAddress: Address) => void;
  setPoolType: (poolType: AllowedPoolTypes | undefined) => void;
  setTokenConfigs: (tokenConfigs: TokenConfig[]) => void;
  setName: (name: string) => void;
  setSymbol: (symbol: string) => void;
  setSwapFeePercentage: (swapFeePercentage: string) => void;
  setSwapFeeManager: (swapFeeManager: Address) => void;
  setPauseManager: (pauseManager: Address) => void;
  setPoolHooksContract: (poolHooksContract: Address) => void;
  setEnableDonation: (enableDonation: boolean) => void;
  setDisableUnbalancedLiquidity: (disableUnbalancedLiquidity: boolean) => void;
  setAmplificationParameter: (amplificationParameter: string) => void;
}

export const initialTokenConfig: TokenConfig = {
  address: "",
  rateProvider: zeroAddress,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  weight: 50, // only used for weighted pools
  tokenInfo: null, // Details including image, symbol, decimals, etc.
  amount: "",
};

export const initialPoolCreationState = {
  step: 1,
  isDelegatingManagement: true,
  isUsingHooks: false,
  poolAddress: undefined, // set after pool deployment
  name: "",
  symbol: "",
  poolType: undefined,
  tokenConfigs: [initialTokenConfig, initialTokenConfig],
  amplificationParameter: "", // only used for stable pools
  swapFeePercentage: "", // store as human readable % to be converted later
  swapFeeManager: "",
  pauseManager: "",
  poolHooksContract: "",
  disableUnbalancedLiquidity: false,
  enableDonation: false,
};

// Stores all the data that will be used for pool creation
export const usePoolCreationStore = create<PoolStore>(set => ({
  ...initialPoolCreationState,
  setIsDelegatingManagement: isDelegatingManagement => set({ isDelegatingManagement }),
  setIsUsingHooks: isUsingHooks => set({ isUsingHooks }),
  setPoolAddress: poolAddress => set({ poolAddress }),
  setStep: step => set({ step }),
  setName: name => set({ name }),
  setSymbol: symbol => set({ symbol }),
  setPoolType: poolType => set({ poolType }),
  setTokenConfigs: tokenConfigs => set({ tokenConfigs }),
  setAmplificationParameter: amplificationParameter => set({ amplificationParameter }),
  setSwapFeePercentage: swapFeePercentage => set({ swapFeePercentage }),
  setSwapFeeManager: swapFeeManager => set({ swapFeeManager }),
  setPauseManager: pauseManager => set({ pauseManager }),
  setPoolHooksContract: poolHooksContract => set({ poolHooksContract }),
  setDisableUnbalancedLiquidity: disableUnbalancedLiquidity => set({ disableUnbalancedLiquidity }),
  setEnableDonation: enableDonation => set({ enableDonation }),
}));

export function usePoolStoreDebug() {
  const poolState = usePoolCreationStore();

  useEffect(() => {
    console.log("Pool Store State:", poolState);
  }, [poolState]);
}
