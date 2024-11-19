import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Token } from "~~/hooks/token";

export interface PoolCreationState {
  chainId: number;
  token1: Token;
  token2: Token;
  token1Amount: string;
  token2Amount: string;
  name: string;
  symbol: string;
  address: Address | undefined; // updated by tx receipt from completion of step 1
  step: number;
  tokenWeights: "5050" | "8020";
  isInitialState: boolean;
}

export const usePoolCreationStore = create(
  persist<{
    poolCreation: PoolCreationState | null;
    setPoolCreation: (pool: PoolCreationState) => void;
    updatePoolCreation: (updates: Partial<PoolCreationState>) => void;
    clearPoolCreation: () => void;
  }>(
    set => ({
      poolCreation: null,
      setPoolCreation: (pool: PoolCreationState) => set({ poolCreation: pool }),
      updatePoolCreation: (updates: Partial<PoolCreationState>) =>
        set(store => ({
          poolCreation: store.poolCreation ? { ...store.poolCreation, ...updates } : null,
        })),
      clearPoolCreation: () => set({ poolCreation: null }),
    }),
    {
      name: "cow-pool-creation-state",
      getStorage: () => localStorage,
    },
  ),
);
