"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useReadPool } from "./useReadPool";
import { Address, isAddress } from "viem";
import * as chains from "viem/chains";
import { useAccount, useSwitchChain } from "wagmi";
import { usePoolCreationStore, useUserDataStore } from "~~/hooks/v3";
import { SupportedPoolTypes } from "~~/utils/constants/";

/**
 * Use search params to:
 * 1. prompt user to connect to the correct network
 * 2. fetch necessary pool details and save them to consistent store
 * 3. useEffect to jump to store to step 2 where user can enter initial amounts
 */

// TODO: figure out how to fetch type of pool. does api have it? if not just use params?
export function useUninitializedPool() {
  const { isConnected } = useAccount();
  const { updateTokenConfig, updatePool, step } = usePoolCreationStore();
  const { updateUserData } = useUserDataStore();
  const searchParams = useSearchParams();
  const { switchChain } = useSwitchChain();

  const type = searchParams.get("type");
  const chainIdString = searchParams.get("chainId") || searchParams.get("chainID");
  const chainId = chainIdString ? parseInt(chainIdString) : 0; // 0 is falsy to prevent useEffect execution
  const address = searchParams.get("address") || "";
  const isValidAddress = isAddress(address);

  // console.log("address", address);
  // console.log("isValidAddress", isValidAddress);

  const { data: pool } = useReadPool(address as Address, chainId);
  const chain = Object.values(chains).find(chain => chain.id === chainId);

  useEffect(() => {
    if (isConnected && chainId && pool?.isRegistered && !pool.poolConfig?.isPoolInitialized) {
      // prompt user to connect to the correct network
      setTimeout(() => {
        switchChain({ chainId: chainId });
      }, 1000); // small delay works by tricking wallet into treating it as semi-interactive?

      // update local store to catapult user to step 2 where pool initialization begins
      if (step < 3) {
        updatePool({
          chain: chain,
          name: pool.name,
          symbol: pool.symbol,
          poolAddress: pool.address,
          step: 2,
          poolType: type as SupportedPoolTypes,
        });
      }

      pool.tokenConfigs.forEach(({ address, rateProvider, tokenInfo, weight }, index) => {
        updateTokenConfig(index, {
          address,
          rateProvider,
          tokenInfo,
          weight,
        });
      });

      updateUserData({ isOnlyInitializingPool: true });
    }
  }, [
    address,
    chainId,
    switchChain,
    isConnected,
    isValidAddress,
    pool,
    chain,
    updatePool,
    step,
    updateTokenConfig,
    updateUserData,
    type,
  ]);
}

// 1 & 0x504a4D7D63b172F41d6fc7D077Da58F35991AF11
