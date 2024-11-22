"use client";

import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useValidateTextField } from "~~/hooks/v3";

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
  const { isValid, errorMessage } = useValidateTextField({
    value,
    mustBeAddress,
    maxLength,
    isRateProvider,
    isPoolHooksContract,
  });

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
          <div className="absolute top-full right-2 text-red-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
