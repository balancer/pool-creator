import React from "react";

interface TextFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDisabled?: boolean;
}

export const TextField: React.FC<TextFieldProps> = ({ label, placeholder, value, onChange, isDisabled }) => {
  return (
    <div className="w-full flex flex-col gap-1">
      <label className="ml-1">{label}</label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={isDisabled}
        className="w-full input rounded-xl bg-base-300 disabled:bg-base-300 px-5 h-[55px] text-lg"
      />
    </div>
  );
};
