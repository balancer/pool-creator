import { useEffect } from "react";
import { PoolType } from "@balancer/sdk";
import { TokenType } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Token } from "~~/hooks/token";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

export const TABS = ["Type", "Tokens", "Parameters", "Information"] as const;
export type TabType = (typeof TABS)[number];

export type AllowedPoolTypes = PoolType.Stable | PoolType.Weighted;

export type TokenConfig = {
  address: Address;
  rateProvider: Address;
  isValidRateProvider: boolean;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: number;
  isWeightLocked: boolean;
  tokenInfo: Token | null;
  amount: string; // human readable
  useBoostedVariant: boolean;
};

export interface TransactionDetails {
  safeHash: `0x${string}` | undefined;
  wagmiHash: `0x${string}` | undefined;
  isSuccess: boolean;
}
export interface PoolCreationStore {
  chain: ChainWithAttributes | undefined;
  step: number;
  selectedTab: TabType;
  isDelegatingPauseManagement: boolean;
  isDelegatingSwapFeeManagement: boolean;
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
  createPoolTx: TransactionDetails;
  initPoolTx: TransactionDetails;
  swapToBoostedTx: TransactionDetails;
  updatePool: (updates: Partial<PoolCreationStore>) => void;
  updateTokenConfig: (index: number, updates: Partial<TokenConfig>) => void;
  clearPoolStore: () => void;
}

export const initialTokenConfig: TokenConfig = {
  address: "",
  rateProvider: zeroAddress,
  isValidRateProvider: false,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  weight: 50, // only used for weighted pools
  isWeightLocked: false,
  tokenInfo: null, // Details including image, symbol, decimals, etc.
  amount: "",
  useBoostedVariant: false,
};

export const initialPoolCreationState = {
  chain: undefined,
  step: 1,
  isDelegatingPauseManagement: true,
  isDelegatingSwapFeeManagement: true,
  isUsingHooks: false,
  poolAddress: undefined, // set after pool deployment by parsing the tx hash
  selectedTab: TABS[0],
  name: "",
  symbol: "",
  poolType: undefined,
  tokenConfigs: [initialTokenConfig, initialTokenConfig],
  amplificationParameter: "", // only used for stable pools
  swapFeePercentage: "" as const, // store as human readable % to be converted later
  swapFeeManager: "" as const,
  pauseManager: "" as const,
  poolHooksContract: "" as const,
  disableUnbalancedLiquidity: false,
  enableDonation: false,
  // isSuccess is only flipped to true after parsing tx receipt for status
  createPoolTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  initPoolTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  swapToBoostedTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
};

// Stores all the data that will be used for pool creation
export const usePoolCreationStore = create(
  persist<PoolCreationStore>(
    set => ({
      ...initialPoolCreationState,
      updatePool: (updates: Partial<PoolCreationStore>) => set(state => ({ ...state, ...updates })),
      updateTokenConfig: (index: number, updates: Partial<TokenConfig>) =>
        set(state => {
          const newTokenConfigs = [...state.tokenConfigs];
          newTokenConfigs[index] = { ...newTokenConfigs[index], ...updates };
          return { ...state, tokenConfigs: newTokenConfigs };
        }),
      clearPoolStore: () => set(initialPoolCreationState),
    }),
    {
      name: "v3-pool-creation-store",
      getStorage: () => localStorage,
    },
  ),
);

export function usePoolStoreDebug() {
  const poolState = usePoolCreationStore();

  useEffect(() => {
    console.log("Persistent Pool Store:", poolState);
  }, [poolState]);
}
