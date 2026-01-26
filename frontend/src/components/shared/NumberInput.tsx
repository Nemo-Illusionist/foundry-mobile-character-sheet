// NumberInput Component - Allows free editing, commits on blur
import { useState, useEffect, InputHTMLAttributes } from 'react';
import './NumberInput.scss';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value' | 'type' | 'size'> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  defaultValue?: number;
  allowEmpty?: boolean;
  commitOnChange?: boolean; // If true, commits immediately on valid input
  inputSize?: 'sm' | 'md';
  variant?: 'default' | 'compact' | 'unstyled';
  centered?: boolean;
}

export function NumberInput({
  value,
  onChange,
  min,
  max,
  defaultValue = 0,
  allowEmpty = false,
  commitOnChange = false,
  inputSize = 'md',
  variant = 'default',
  centered = false,
  className = '',
  ...props
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(String(value));

  // Sync input with external value changes
  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const clamp = (num: number): number => {
    let result = num;
    if (min !== undefined) result = Math.max(min, result);
    if (max !== undefined) result = Math.min(max, result);
    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;

    // Allow empty string, minus sign, and numbers
    if (val === '' || val === '-' || /^-?\d*$/.test(val)) {
      setInputValue(val);

      // If commitOnChange is true and we have a valid number, commit it
      if (commitOnChange && val !== '' && val !== '-') {
        const num = parseInt(val, 10);
        if (!isNaN(num)) {
          onChange(clamp(num));
        }
      }
    }
  };

  const handleBlur = () => {
    const trimmed = inputValue.trim();

    if (trimmed === '' || trimmed === '-') {
      if (allowEmpty) {
        onChange(defaultValue);
        setInputValue(String(defaultValue));
      } else {
        onChange(defaultValue);
        setInputValue(String(defaultValue));
      }
      return;
    }

    const num = parseInt(trimmed, 10);
    if (isNaN(num)) {
      onChange(defaultValue);
      setInputValue(String(defaultValue));
    } else {
      const clamped = clamp(num);
      onChange(clamped);
      setInputValue(String(clamped));
    }
  };

  const classes = [
    'number-input',
    `number-input-${inputSize}`,
    `number-input-${variant}`,
    centered && 'number-input-center',
    className,
  ].filter(Boolean).join(' ');

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="-?[0-9]*"
      className={classes}
      value={inputValue}
      onChange={handleChange}
      onBlur={handleBlur}
      {...props}
    />
  );
}
