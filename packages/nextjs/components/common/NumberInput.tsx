import React from "react";

interface NumberInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberInput({ label, placeholder, value, onChange, isDisabled, min, max, step }: NumberInputProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="ml-1">{label}</label>
      <input
        type="number"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        min={min}
        max={max}
        step={step}
        className="shadow-inner border-0 rounded-xl w-full input bg-base-300 disabled:text-base-content disabled:bg-base-300 px-5 text-lg"
      />
    </div>
  );
}
