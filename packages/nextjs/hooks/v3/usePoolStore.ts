import { useEffect } from "react";
import { Address, parseUnits, zeroAddress } from "viem";
import { create } from "zustand";
import { PoolType, TokenConfig, TokenType } from "~~/hooks/v3/types";

interface PoolState {
  type: PoolType | undefined;
  tokens: TokenConfig[];
  name: string;
  symbol: string;
  swapFeePercentage: bigint | undefined;
  swapFeeManager: Address | undefined;
  pauseManager: Address | undefined;
  poolHooksContract: Address | undefined;
  disableUnbalancedLiquidity: boolean;
  donationsEnabled: boolean;
  setType: (type: PoolType | undefined) => void;
  setTokenConfigs: (tokens: TokenConfig[]) => void;
  setName: (name: string) => void;
  setSymbol: (symbol: string) => void;
  setSwapFeePercentage: (swapFeePercentage: bigint) => void;
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
  symbol: undefined,
  logoURI: undefined,
};

export const usePoolStore = create<PoolState>(set => ({
  name: "",
  symbol: "",
  type: undefined,
  tokens: [initialTokenConfig, initialTokenConfig],
  amplificationParameter: undefined, // only used for stable pools
  swapFeePercentage: undefined,
  swapFeeManager: undefined,
  poolHooksContract: undefined,
  pauseManager: undefined,
  donationsEnabled: false,
  disableUnbalancedLiquidity: false,
  setName: name => set({ name }),
  setSymbol: symbol => set({ symbol }),
  setType: type => set({ type }),
  setTokenConfigs: tokens => set({ tokens }),
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
