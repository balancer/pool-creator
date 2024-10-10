import { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { Address, parseUnits, zeroAddress } from "viem";
import { create } from "zustand";
import { TokenConfig, TokenType } from "~~/hooks/v3/types";

export type AllowedPoolTypes = PoolType.Stable | PoolType.Weighted;

interface PoolStore {
  poolType: AllowedPoolTypes | undefined;
  tokenConfigs: TokenConfig[];
  name: string;
  symbol: string;
  swapFeePercentage: string;
  swapFeeManager: Address | undefined;
  pauseManager: Address | undefined;
  poolHooksContract: Address | undefined;
  disableUnbalancedLiquidity: boolean;
  enableDonation: boolean;
  amplificationParameter: string;
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
  address: undefined,
  rateProvider: zeroAddress,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  weight: parseUnits("50", 16), // only used for weighted pools
  tokenInfo: null, // only used for UI purposes
};

// Stores all the data that will be used for pool creation
export const usePoolStore = create<PoolStore>(set => ({
  name: "",
  symbol: "",
  poolType: undefined,
  tokenConfigs: [initialTokenConfig, initialTokenConfig],
  amplificationParameter: "", // only used for stable pools
  swapFeePercentage: "", // store as human readable % to be converted later
  swapFeeManager: undefined,
  poolHooksContract: undefined,
  pauseManager: undefined,
  enableDonation: false,
  disableUnbalancedLiquidity: false,
  setName: name => set({ name }),
  setSymbol: symbol => set({ symbol }),
  setPoolType: poolType => set({ poolType }),
  setTokenConfigs: tokenConfigs => set({ tokenConfigs }),
  setSwapFeePercentage: swapFeePercentage => set({ swapFeePercentage }),
  setAmplificationParameter: amplificationParameter => set({ amplificationParameter }),
  setPauseManager: pauseManager => set({ pauseManager }),
  setPoolHooksContract: poolHooksContract => set({ poolHooksContract }),
  setSwapFeeManager: swapFeeManager => set({ swapFeeManager }),
  setDisableUnbalancedLiquidity: disableUnbalancedLiquidity => set({ disableUnbalancedLiquidity }),
  setEnableDonation: enableDonation => set({ enableDonation }),
}));

export function usePoolStoreDebug() {
  const poolState = usePoolStore();

  useEffect(() => {
    console.log("Pool Store State:", poolState);
  }, [poolState]);
}
