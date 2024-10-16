import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Token } from "~~/hooks/token";

export interface PoolCreationState {
  chainId: number;
  token1: Token;
  token2: Token;
  token1Amount: string;
  token2Amount: string;
  poolName: string;
  poolSymbol: string;
  step: number;
  tokenWeights: "5050" | "8020";
}

export const usePoolCreationPersistedState = create(
  persist<{
    state: PoolCreationState | null;
    setPersistedState: (state: PoolCreationState) => void;
    clearPersistedState: () => void;
  }>(
    set => ({
      state: null,
      setPersistedState: (state: PoolCreationState) => set({ state }),
      clearPersistedState: () => set({ state: null }),
    }),
    {
      name: "cow-pool-creation-state",
      getStorage: () => localStorage,
    },
  ),
);
