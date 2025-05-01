import { useEffect } from "react";
import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserDataStore = {
  userTokenBalances: Record<Address, string>;
  hasEditedPoolName: boolean;
  hasEditedPoolSymbol: boolean;
  hasAgreedToWarning: boolean;
  hasEditedEclpParams: boolean;
  updateUserData: (updates: Partial<UserDataStore>) => void;
  clearUserData: () => void;
};

export const initialUserDataStore = {
  userTokenBalances: {},
  hasAgreedToWarning: false,
  hasEditedPoolName: false,
  hasEditedPoolSymbol: false,
  hasEditedEclpParams: false,
};

// Stores all the data that will be used for pool creation
export const useUserDataStore = create(
  persist<UserDataStore>(
    set => ({
      ...initialUserDataStore,
      updateUserData: (updates: Partial<UserDataStore>) => set(state => ({ ...state, ...updates })),
      clearUserData: () => set(initialUserDataStore),
    }),
    {
      name: "v3-pool-creation-user-data",
      getStorage: () => localStorage,
    },
  ),
);

export function useUserDataStoreDebug() {
  const userDataState = useUserDataStore();

  useEffect(() => {
    console.log("User Data Store:", userDataState);
  }, [userDataState]);
}
