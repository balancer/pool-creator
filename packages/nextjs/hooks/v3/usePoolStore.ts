import { useEffect } from "react";
import { Address, parseUnits, zeroAddress } from "viem";
import { create } from "zustand";
import { PoolType, TokenConfig, TokenType } from "~~/hooks/v3/types";

interface PoolStore {
  type: PoolType | undefined;
  tokenConfigs: TokenConfig[];
  name: string;
  symbol: string;
  swapFeePercentage: string;
  swapFeeManager: Address | undefined;
  pauseManager: Address | undefined;
  poolHooksContract: Address | undefined;
  disableUnbalancedLiquidity: boolean;
  donationsEnabled: boolean;
  setType: (type: PoolType | undefined) => void;
  setTokenConfigs: (tokenConfigs: TokenConfig[]) => void;
  setName: (name: string) => void;
  setSymbol: (symbol: string) => void;
  setSwapFeePercentage: (swapFeePercentage: string) => void;
  setSwapFeeManager: (swapFeeManager: Address) => void;
  setPauseManager: (pauseManager: Address) => void;
  setPoolHooksContract: (poolHooksContract: Address) => void;
  setDonationsEnabled: (donationsEnabled: boolean) => void;
  setDisableUnbalancedLiquidity: (disableUnbalancedLiquidity: boolean) => void;
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
  type: undefined,
  tokenConfigs: [initialTokenConfig, initialTokenConfig],
  amplificationParameter: undefined, // only used for stable pools
  swapFeePercentage: "", // store as human readable % to be converted later
  swapFeeManager: undefined,
  poolHooksContract: undefined,
  pauseManager: undefined,
  donationsEnabled: false,
  disableUnbalancedLiquidity: false,
  setName: name => set({ name }),
  setSymbol: symbol => set({ symbol }),
  setType: type => set({ type }),
  setTokenConfigs: tokenConfigs => set({ tokenConfigs }),
  setSwapFeePercentage: swapFeePercentage => set({ swapFeePercentage }),
  setPauseManager: pauseManager => set({ pauseManager }),
  setPoolHooksContract: poolHooksContract => set({ poolHooksContract }),
  setSwapFeeManager: swapFeeManager => set({ swapFeeManager }),
  setDisableUnbalancedLiquidity: disableUnbalancedLiquidity => set({ disableUnbalancedLiquidity }),
  setDonationsEnabled: donationsEnabled => set({ donationsEnabled }),
}));

export function usePoolStoreDebug() {
  const poolState = usePoolStore();

  useEffect(() => {
    console.log("Pool Store State:", poolState);
  }, [poolState]);
}
