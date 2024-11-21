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
}) => {
  const { isValid, errorMessage } = useValidateTextField({ value, mustBeAddress, maxLength, isRateProvider });

  return (
    <div className="w-full relative">
      <div className="mb-1 flex items-center gap-1 px-2">{label && <label className="font-bold">{label}</label>}</div>
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        disabled={isDisabled}
        className={`
          shadow-inner border-0 rounded-xl w-full input bg-base-300 
          disabled:text-base-content disabled:bg-base-300 px-5 text-lg
          ${!isValid ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-primary"}
        `}
      />
      <div className="absolute bottom-0.5 right-3 flex gap-4">
        {errorMessage && (
          <div className="text-red-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4" />
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};
