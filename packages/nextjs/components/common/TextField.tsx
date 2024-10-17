import React from "react";

interface TextFieldProps {
  label?: string;
  placeholder?: string;
  value: string | undefined;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({ label, placeholder, value, onChange, isDisabled }) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="ml-1 font-bold">{label}</label>}
      <input
        type="text"
        placeholder={placeholder}
        value={value ?? ""}
        onChange={onChange}
        disabled={isDisabled}
        className="shadow-inner border-0 rounded-xl w-full input bg-base-300 disabled:text-base-content disabled:bg-base-300 px-5 text-lg"
      />
    </div>
  );
};
