import React from "react";

interface CheckboxProps {
  label: string | React.ReactNode;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
}

export const Checkbox = ({ label, checked, onChange, disabled = false }: CheckboxProps) => {
  return (
    <div className="form-control">
      <div className="flex items-center">
        <span className="label-text text-lg">{label}</span>
        <label className="cursor-pointer flex items-center">
          <input
            type="checkbox"
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="checkbox ml-2 rounded-md"
          />
        </label>
      </div>
    </div>
  );
};
