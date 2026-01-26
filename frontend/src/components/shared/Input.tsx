// Input Component
import { InputHTMLAttributes } from 'react';
import './Input.scss';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  inputSize?: 'sm' | 'md';
  variant?: 'default' | 'compact';
}

export function Input({
  label,
  error,
  inputSize = 'md',
  variant = 'default',
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="input-wrapper">
      {label && <label className="input-label">{label}</label>}
      <input
        className={`input input-${inputSize} input-${variant} ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
