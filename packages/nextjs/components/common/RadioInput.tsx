import React from "react";

interface RadioInputProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  label: string;
}

export function RadioInput({ name, checked, onChange, label }: RadioInputProps) {
  return (
    <div className="form-control">
      <label className="label cursor-pointer flex flex-row gap-2">
        <input
          type="radio"
          name={name}
          className="radio checked:bg-base-content"
          checked={checked}
          onChange={onChange}
        />
        <span className="label-text">{label}</span>
      </label>
    </div>
  );
}
