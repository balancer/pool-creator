import React from "react";

interface CheckboxProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: () => void;
}

export const Checkbox = ({ label, checked, onChange }: CheckboxProps) => {
  return (
    <div className="form-control">
      <div className="flex items-center">
        <span className="label-text text-lg">{label}</span>
        <label className="cursor-pointer flex items-center">
          <input type="checkbox" checked={checked} onChange={onChange} className="checkbox ml-2 rounded-md" />
        </label>
      </div>
    </div>
  );
};
