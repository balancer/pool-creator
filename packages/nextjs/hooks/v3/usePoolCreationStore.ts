import { TokenType } from "@balancer/sdk";
import { Address, zeroAddress } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { type TabType } from "~~/app/v3/_components/PoolConfiguration";
import { type Token } from "~~/hooks/token";
import { SupportedPoolTypes } from "~~/utils/constants";
import { ChainWithAttributes } from "~~/utils/scaffold-eth";

export type TokenConfig = {
  address: Address;
  rateProvider: Address;
  currentRate: bigint | undefined;
  paysYieldFees: boolean;
  tokenType: TokenType;
  weight: string;
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
  usdPerTokenInput0: string;
  usdPerTokenInput1: string;
};

export type ReClammParams = {
  initialTargetPrice: string;
  initialMinPrice: string;
  initialMaxPrice: string;
  priceShiftDailyRate: string;
  centerednessMargin: string;
  initialBalanceA: string;
  usdPerTokenInputA: string;
  usdPerTokenInputB: string;
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
  poolAddress: Address | undefined;
  poolType: SupportedPoolTypes | undefined;
  tokenConfigs: TokenConfig[];
  name: string;
  symbol: string;
  swapFeePercentage: string;
  swapFeeManager: Address | "";
  pauseManager: Address | "";
  poolHooksContract: Address | "";
  disableUnbalancedLiquidity: boolean;
  enableDonation: boolean;
  amplificationParameter: string;
  createPoolTx: TransactionDetails;
  initPoolTx: TransactionDetails;
  swapToBoostedTx: TransactionDetails;
  setMaxSurgeFeeTx: TransactionDetails;
  eclpParams: EclpParams;
  reClammParams: ReClammParams;
  updatePool: (updates: Partial<PoolCreationStore>) => void;
  updateTokenConfig: (index: number, updates: Partial<TokenConfig>) => void;
  updateEclpParam: (updates: Partial<EclpParams>) => void;
  updateReClammParam: (updates: Partial<ReClammParams>) => void;
  clearPoolStore: () => void;
}

export const initialTokenConfig: TokenConfig = {
  address: zeroAddress,
  rateProvider: zeroAddress,
  currentRate: undefined,
  paysYieldFees: false,
  tokenType: TokenType.STANDARD,
  isWeightLocked: false,
  tokenInfo: null, // Details including image, symbol, decimals, etc.
  amount: "",
  useBoostedVariant: false,
  weight: "", // only used for weighted pools
};

export const initialEclpParams: EclpParams = {
  alpha: "",
  beta: "",
  c: "",
  s: "",
  lambda: "",
  peakPrice: "", // peak price only for UX purposes, not sent in tx
  usdPerTokenInput0: "",
  usdPerTokenInput1: "",
};

export const initialReClammParams: ReClammParams = {
  initialTargetPrice: "",
  initialMinPrice: "",
  initialMaxPrice: "",
  priceShiftDailyRate: "150",
  centerednessMargin: "25",
  initialBalanceA: "100",
  usdPerTokenInputA: "",
  usdPerTokenInputB: "",
};

export const initialPoolCreationState = {
  chain: undefined,
  step: 1,
  isDelegatingPauseManagement: true,
  isDelegatingSwapFeeManagement: true,
  poolAddress: undefined, // set after pool deployment by parsing the tx hash
  selectedTab: "Type" as const,
  name: "",
  symbol: "",
  poolType: undefined,
  tokenConfigs: [initialTokenConfig, initialTokenConfig],
  swapFeePercentage: "", // store as human readable % to be converted later
  swapFeeManager: "" as Address,
  pauseManager: "" as Address,
  poolHooksContract: zeroAddress,
  disableUnbalancedLiquidity: false,
  enableDonation: false,
  // Pool type specific params
  amplificationParameter: "", // used for stable and stable surge pool types
  eclpParams: initialEclpParams,
  reClammParams: initialReClammParams,
  // isSuccess is only flipped to true after parsing tx receipt for status
  createPoolTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  initPoolTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  swapToBoostedTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  setMaxSurgeFeeTx: { safeHash: undefined, wagmiHash: undefined, isSuccess: false },
  // UX controls
  isChooseTokenAmountsModalOpen: false,
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
