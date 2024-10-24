import { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TokenType } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { create } from "zustand";
import { type Token } from "~~/hooks/token";

export const TABS = ["Type", "Tokens", "Parameters", "Information"] as const;
export type TabType = (typeof TABS)[number];

export type AllowedPoolTypes = PoolType.Stable | PoolType.Weighted;

export type TokenConfig = {
  address: Address;
  rateProvider: Address;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: number;
  tokenInfo: Token | null;
  amount: string; // human readable
  useBoostedVariant: boolean;
};

export interface PoolCreationStore {
  step: number;
  selectedTab: TabType;
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
  createPoolTxHash: string | undefined;
  initPoolTxHash: string | undefined;
  updatePool: (updates: Partial<PoolCreationStore>) => void;
  updateTokenConfig: (index: number, updates: Partial<TokenConfig>) => void;
  clearPoolStore: () => void;
}

export const initialTokenConfig: TokenConfig = {
  address: "",
  rateProvider: zeroAddress,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  weight: 50, // only used for weighted pools
  tokenInfo: null, // Details including image, symbol, decimals, etc.
  amount: "",
  useBoostedVariant: false,
};

export const initialPoolCreationState = {
  step: 1,
  isDelegatingManagement: true,
  isUsingHooks: false,
  poolAddress: undefined, // set after pool deployment
  selectedTab: TABS[0],
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
  createPoolTxHash: undefined,
  initPoolTxHash: undefined,
};

// Stores all the data that will be used for pool creation
export const usePoolCreationStore = create<PoolCreationStore>(set => ({
  ...initialPoolCreationState,
  updatePool: (updates: Partial<PoolCreationStore>) => set(state => ({ ...state, ...updates })),
  updateTokenConfig: (index: number, updates: Partial<TokenConfig>) =>
    set(state => {
      const newTokenConfigs = [...state.tokenConfigs];
      newTokenConfigs[index] = { ...newTokenConfigs[index], ...updates };
      return { ...state, tokenConfigs: newTokenConfigs };
    }),
  clearPoolStore: () => set(initialPoolCreationState),
}));

export function usePoolStoreDebug() {
  const poolState = usePoolCreationStore();

  useEffect(() => {
    console.log("Pool Store State:", poolState);
  }, [poolState]);
}
