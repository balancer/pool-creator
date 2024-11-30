import { useQuery } from "@tanstack/react-query";
import { Address, isAddress } from "viem";
import { usePublicClient } from "wagmi";
import { usePoolCreationStore } from "~~/hooks/v3";

export const useValidateHooksContract = (isPoolHooksContract: boolean | undefined, value: string | undefined) => {
  const publicClient = usePublicClient();
  const { updatePool } = usePoolCreationStore();

  return useQuery({
    queryKey: ["validatePoolHooks", value],
    queryFn: async (): Promise<HookFlags | false> => {
      try {
        if (!publicClient) throw new Error("No public client for validatePoolHooks");
        const hookFlags = (await publicClient.readContract({
          address: value as Address,
          abi: HooksAbi,
          functionName: "getHookFlags",
          args: [],
        })) as HookFlags;
        console.log("getHookFlags()", hookFlags);
        if (hookFlags.enableHookAdjustedAmounts) {
          updatePool({ disableUnbalancedLiquidity: true });
        }
        return hookFlags;
      } catch {
        updatePool({ disableUnbalancedLiquidity: false });
        return false;
      }
    },
    enabled: isPoolHooksContract && !!value && isAddress(value as string),
  });
};

export interface HookFlags {
  enableHookAdjustedAmounts: boolean;
  shouldCallBeforeInitialize: boolean;
  shouldCallAfterInitialize: boolean;
  shouldCallComputeDynamicSwapFee: boolean;
  shouldCallBeforeSwap: boolean;
  shouldCallAfterSwap: boolean;
  shouldCallBeforeAddLiquidity: boolean;
  shouldCallAfterAddLiquidity: boolean;
  shouldCallBeforeRemoveLiquidity: boolean;
  shouldCallAfterRemoveLiquidity: boolean;
}

const HooksAbi = [
  {
    inputs: [],
    name: "getHookFlags",
    outputs: [
      {
        components: [
          {
            internalType: "bool",
            name: "enableHookAdjustedAmounts",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallBeforeInitialize",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallAfterInitialize",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallComputeDynamicSwapFee",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallBeforeSwap",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallAfterSwap",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallBeforeAddLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallAfterAddLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallBeforeRemoveLiquidity",
            type: "bool",
          },
          {
            internalType: "bool",
            name: "shouldCallAfterRemoveLiquidity",
            type: "bool",
          },
        ],
        internalType: "struct HookFlags",
        name: "hookFlags",
        type: "tuple",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
];
