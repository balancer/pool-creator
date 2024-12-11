import React from "react";

interface RadioInputProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function RadioInput({ name, checked, onChange, label }: RadioInputProps) {
  return (
    <div className="">
      <label className="label cursor-pointer justify-start gap-2 p-1">
        <input
          type="radio"
          name={name}
          className="radio checked:bg-base-content p-0"
          checked={checked}
          onChange={onChange}
        />
        <span className="text-lg">{label}</span>
      </label>
    </div>
  );
}
