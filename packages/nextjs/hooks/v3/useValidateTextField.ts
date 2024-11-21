import { useCallback, useEffect, useState } from "react";
import { isAddress, parseAbi } from "viem";
import { usePublicClient } from "wagmi";

interface ValidationProps {
  value?: string;
  mustBeAddress?: boolean;
  maxLength?: number;
  isRateProvider?: boolean;
  // Add your new validation props here
}

// TODO: Add validation check for hooks that looks for "getHookFlags()" and "onRegister()"
export function useValidateTextField({ value, mustBeAddress, maxLength, isRateProvider }: ValidationProps) {
  const publicClient = usePublicClient();
  const [isValidRateProvider, setIsValidRateProvider] = useState(false);

  const fetchRate = useCallback(async () => {
    if (!isRateProvider || !value || !isAddress(value)) return;
    try {
      if (!publicClient) throw new Error("No public client");
      const rate = await publicClient.readContract({
        address: value,
        abi: parseAbi(["function getRate() external view returns (uint256)"]),
        functionName: "getRate",
        args: [],
      });
      console.log("rate", rate);
      setIsValidRateProvider(true);
    } catch (error) {
      console.error(error);
      setIsValidRateProvider(false);
    }
  }, [value, publicClient, isRateProvider]);

  useEffect(() => {
    fetchRate();
  }, [fetchRate]);

  const isValidAddress = !mustBeAddress || !value || isAddress(value);
  const isValidLength = maxLength ? value?.length && value.length <= maxLength : true;
  // Add your new validation checks here

  const getErrorMessage = () => {
    if (!isValidAddress) return "Invalid address";
    if (isRateProvider && !isValidRateProvider) return "Invalid provider";
    if (!isValidLength) return `Pool name is too long: ${value?.length ?? 0}/${maxLength}`;
    // Add your new error messages here
    return null;
  };

  return {
    isValid: isValidAddress && isValidLength && (!isRateProvider || isValidRateProvider),
    errorMessage: getErrorMessage(),
  };
}
