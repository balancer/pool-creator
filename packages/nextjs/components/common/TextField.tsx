import React from "react";
import { isAddress } from "viem";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  mustBeAddress?: boolean;
  maxLength?: number;
}

export const TextField: React.FC<TextFieldProps> = ({
  label,
  placeholder,
  value,
  onChange,
  isDisabled,
  mustBeAddress,
  maxLength,
}) => {
  const isValidValue = !mustBeAddress || !value || isAddress(value);

  const isValidLength = maxLength ? value?.length && value.length <= maxLength : true;

  return (
    <div className="w-full">
      <div className="mb-1 flex justify-between items-center gap-1 px-2">
        {label && <label className="font-bold">{label}</label>}
        {!isValidValue && (
          <div className="text-red-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="w-4 h-4 mt-0.5" />
            Invalid address
          </div>
        )}
        {!isValidLength && (
          <div className="text-sm text-error">
            Pool name is too long: {value?.length ?? 0}/{maxLength}
          </div>
        )}
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        disabled={isDisabled}
        className={`shadow-inner border-0 rounded-xl w-full input bg-base-300 disabled:text-base-content disabled:bg-base-300 px-5 text-lg
          ${!isValidValue || (!isValidLength && "ring-1 ring-red-400")}`}
      />
    </div>
  );
};
