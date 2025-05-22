import React from "react";

interface NumberInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  isPercentage?: boolean; // New prop to control percentage display
}

export function NumberInput({
  label,
  placeholder,
  value,
  onChange,
  isDisabled,
  min,
  max,
  step,
  isPercentage = false, // Default to false
}: NumberInputProps) {
  const isValid = !value || ((!min || parseFloat(value) >= min) && (!max || parseFloat(value) <= max));

  // Add error message logic
  const getErrorMessage = () => {
    if (!value || !isValid) {
      const numValue = parseFloat(value);
      if (min !== undefined && numValue < min) return `Value must be at least ${min}`;
      if (max !== undefined && numValue > max) return `Value must be at most ${max}`;
    }
    return "";
  };

  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="ml-1 font-bold">{label}</label>}
      <div className="relative">
        <input
          type="number"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          min={min}
          max={max}
          step={step}
          className={`
            shadow-inner border-0 rounded-xl w-full input bg-base-300 
            disabled:text-base-content disabled:bg-base-300 px-5 text-lg pr-8
            ${!isValid ? "ring-2 ring-red-400 focus:ring-red-400" : "focus:ring-primary"}
          `}
        />
        {isPercentage && (
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400">%</span>
        )}
        {!isValid && (
          <div className="absolute left-1 top-full text-red-400 text-sm mt-0 whitespace-nowrap overflow-hidden text-ellipsis">
            {getErrorMessage()}
          </div>
        )}
      </div>
    </div>
  );
}
