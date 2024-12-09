import { useEffect } from "react";
import { Address } from "viem";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserDataStore = {
  userTokenBalances: Record<Address, string>;
  hasEditedPoolInformation: boolean;
  hasAgreedToWarning: boolean;
  updateUserData: (updates: Partial<UserDataStore>) => void;
  clearUserData: () => void;
};

export const initialUserDataStore = {
  userTokenBalances: {},
  hasEditedPoolInformation: false,
  hasAgreedToWarning: false,
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
    console.log("User Data Store State:", userDataState);
  }, [userDataState]);
}
