"use client";

import { isAddress } from "viem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useValidateHooksContract, useValidateRateProvider } from "~~/hooks/v3";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  mustBeAddress?: boolean;
  maxLength?: number;
  isRateProvider?: boolean;
  isPoolHooksContract?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isDisabled,
  mustBeAddress,
  maxLength,
  isRateProvider,
  isPoolHooksContract,
}) => {
  const { data: isValidRateProvider = true } = useValidateRateProvider(isRateProvider, value);
  const { data: isValidPoolHooksContract = true } = useValidateHooksContract(isPoolHooksContract, value);
  const isValidAddress = !mustBeAddress || !value || isAddress(value);
  const isValidLength = maxLength ? value?.length && value.length <= maxLength : true;

  const getErrorMessage = () => {
    if (!isValidAddress) return "Invalid address";
    if (isRateProvider && !isValidRateProvider) return "Invalid rate provider";
    if (isPoolHooksContract && !isValidPoolHooksContract) return "Invalid pool hooks contract";
    if (maxLength && !isValidLength) return `Pool name is too long: ${value?.length ?? 0}/${maxLength}`;
    return null;
  };

  const isValid =
    isValidAddress &&
    (!maxLength || isValidLength) &&
    (!isRateProvider || isValidRateProvider) &&
    (!isPoolHooksContract || isValidPoolHooksContract);

  return (
    <div className="w-full mb-2">
      <div className="mb-1 flex items-center gap-1 px-2">{label && <label className="font-bold">{label}</label>}</div>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          value={value ?? ""}
          onChange={onChange}
          disabled={isDisabled}
          className={`
            shadow-inner border-0 rounded-xl w-full input bg-base-300 
            disabled:text-base-content disabled:bg-base-300 px-5 text-lg
            ${!!value && !isValid ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-primary"}
          `}
        />
        {!!value && !isValid && (
          <div className="absolute -top-7 right-2 text-red-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {getErrorMessage()}
          </div>
        )}
      </div>
    </div>
  );
};
