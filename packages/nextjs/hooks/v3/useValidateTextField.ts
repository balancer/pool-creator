import { useQuery } from "@tanstack/react-query";
import { Address, isAddress, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

interface ValidationProps {
  value?: string;
  mustBeAddress?: boolean;
  maxLength?: number;
  isRateProvider?: boolean;
  isPoolHooksContract?: boolean;
}

export function useValidateTextField({
  value,
  mustBeAddress,
  maxLength,
  isRateProvider,
  isPoolHooksContract,
}: ValidationProps) {
  const publicClient = usePublicClient();

  const { data: isValidRateProvider = false } = useQuery({
    queryKey: ["validateRateProvider", value],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("No public client for validateRateProvider");
        const rate = await publicClient.readContract({
          address: value as Address,
          abi: parseAbi(["function getRate() external view returns (uint256)"]),
          functionName: "getRate",
          args: [],
        });
        console.log("getRate()", rate);
        return true;
      } catch {
        return false;
      }
    },
    enabled: isRateProvider && !!value && isAddress(value as string),
  });

  const { data: isValidPoolHooksContract = false } = useQuery({
    queryKey: ["validatePoolHooks", value],
    queryFn: async () => {
      try {
        if (!publicClient) throw new Error("No public client for validatePoolHooks");
        const hookFlags = await publicClient.readContract({
          address: value as Address,
          abi: HooksAbi,
          functionName: "getHookFlags",
          args: [],
        });
        console.log("getHookFlags()", hookFlags);
        return true;
      } catch {
        return false;
      }
    },
    enabled: isPoolHooksContract && !!value && isAddress(value as string),
  });

  const isValidAddress = !mustBeAddress || !value || isAddress(value);
  const isValidLength = maxLength ? value?.length && value.length <= maxLength : true;

  const getErrorMessage = () => {
    if (!isValidAddress) return "Invalid address";
    if (isRateProvider && !isValidRateProvider) return "Invalid rate provider";
    if (isPoolHooksContract && !isValidPoolHooksContract) return "Invalid pool hooks contract";
    if (maxLength && !isValidLength) return `Pool name is too long: ${value?.length ?? 0}/${maxLength}`;
    return null;
  };

  return {
    isValid:
      isValidAddress &&
      (!maxLength || isValidLength) &&
      (!isRateProvider || isValidRateProvider) &&
      (!isPoolHooksContract || isValidPoolHooksContract),
    errorMessage: getErrorMessage(),
  };
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
