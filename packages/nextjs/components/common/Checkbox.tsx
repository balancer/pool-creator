import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => {
  return (
    <div className="form-control">
      <label className="cursor-pointer flex items-center">
        <span className="label-text text-lg">{label}</span>
        <input type="checkbox" checked={checked} onChange={onChange} className="checkbox ml-2 rounded-md" />
      </label>
    </div>
  );
};
