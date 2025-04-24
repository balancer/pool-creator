import { useEffect } from "react";
import { TokenType } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type Token } from "~~/hooks/token";
import { SupportedPoolTypes } from "~~/utils";
import { sortTokenConfigs } from "~~/utils/helpers";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

export const TABS = ["Type", "Tokens", "Parameters", "Finalize"] as const;
export type TabType = (typeof TABS)[number];

export type TokenConfig = {
  address: Address;
  rateProvider: Address;
  isValidRateProvider: boolean;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: number | undefined;
  isWeightLocked: boolean;
  tokenInfo: Token | null;
  amount: string; // human readable
  useBoostedVariant: boolean;
};

export type EclpParams = {
  alpha: string;
  beta: string;
  c: string;
  s: string;
  lambda: string;
  peakPrice: string;
  isTokenOrderInverted: boolean;
  usdValueToken0: string;
  usdValueToken1: string;
};

export type ReClammParams = {
  initialTargetPrice: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  priceShiftDailyRate: string;
  centerednessMargin: string;
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
  poolType: SupportedPoolTypes | undefined;
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
  eclpParams: EclpParams;
  reClammParams: ReClammParams;
  updatePool: (updates: Partial<PoolCreationStore>) => void;
  updateTokenConfig: (index: number, updates: Partial<TokenConfig>) => void;
  updateEclpParam: (updates: Partial<EclpParams>) => void;
  updateReClammParam: (updates: Partial<ReClammParams>) => void;
  clearPoolStore: () => void;
}

export const initialTokenConfig: TokenConfig = {
  address: "",
  rateProvider: zeroAddress,
  isValidRateProvider: false,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  isWeightLocked: false,
  tokenInfo: null, // Details including image, symbol, decimals, etc.
  amount: "",
  useBoostedVariant: false,
  weight: undefined, // only used for weighted pools
};

export const initialEclpParams: EclpParams = {
  alpha: "",
  beta: "",
  c: "",
  s: "",
  lambda: "",
  peakPrice: "", // peak price only for UX purposes, not sent in tx
  isTokenOrderInverted: false, // inverted relative to alphanumeric (used for chart toggle)
  usdValueToken0: "",
  usdValueToken1: "",
  // poolSpotPrice: null,
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
  swapFeePercentage: "" as const, // store as human readable % to be converted later
  swapFeeManager: "" as const,
  pauseManager: "" as const,
  poolHooksContract: "" as const,
  disableUnbalancedLiquidity: false,
  enableDonation: false,
  // For stable and stableSurge
  amplificationParameter: "", // only used for stable pools
  // For gyroECLP
  eclpParams: initialEclpParams,
  // For ReClamm
  reClammParams: {
    initialTargetPrice: "",
    initialMinPrice: "",
    initialMaxPrice: "",
    priceShiftDailyRate: "",
    centerednessMargin: "",
  },
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
          return { ...state, tokenConfigs: sortTokenConfigs(newTokenConfigs) }; // ensure token configs are always sorted in state
        }),
      updateEclpParam: (updates: Partial<EclpParams>) =>
        set(state => ({
          ...state,
          eclpParams: { ...state.eclpParams, ...updates },
        })),
      updateReClammParam: (updates: Partial<ReClammParams>) =>
        set(state => ({
          ...state,
          reClammParams: { ...state.reClammParams, ...updates },
        })),
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
    console.log("Pool Store:", poolState);
  }, [poolState]);
}
