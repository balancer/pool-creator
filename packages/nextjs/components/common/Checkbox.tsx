import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: () => void;
}

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => {
  return (
    <div className="form-control flex flex-row gap-3">
      <label className="label cursor-pointer p-1">
        <input type="checkbox" checked={checked} onChange={onChange} className="checkbox mr-2 rounded-md" />
        <span className="label-text text-lg">{label}</span>
      </label>
    </div>
  );
};
