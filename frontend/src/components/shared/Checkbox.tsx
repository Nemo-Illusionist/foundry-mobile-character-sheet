// Checkbox Component - Standalone checkbox with optional label
// Used for SpellModal V/S/M, prepared spells, etc.

import { InputHTMLAttributes } from 'react';
import './Checkbox.scss';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'size'> {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  variant?: 'default' | 'inline';
  checkboxSize?: 'sm' | 'md';
}

export function Checkbox({
  checked,
  onChange,
  label,
  variant = 'default',
  checkboxSize = 'md',
  className = '',
  disabled,
  ...props
}: CheckboxProps) {
  const handleChange = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <label
      className={`checkbox checkbox-${variant} checkbox-${checkboxSize} ${disabled ? 'checkbox-disabled' : ''} ${className}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="checkbox-input"
        {...props}
      />
      <span className="checkbox-box" />
      {label && <span className="checkbox-label">{label}</span>}
    </label>
  );
}
