// Textarea Component - Multi-line text input
// Used for BiographyTab, Notes, Description

import { TextareaHTMLAttributes } from 'react';
import './Textarea.scss';

interface TextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  value: string;
  onChange: (value: string) => void;
  variant?: 'default' | 'compact';
  error?: string;
  label?: string;
}

export function Textarea({
  value,
  onChange,
  variant = 'default',
  error,
  label,
  className = '',
  rows = 3,
  ...props
}: TextareaProps) {
  return (
    <div className={`textarea-wrapper ${error ? 'has-error' : ''} ${className}`}>
      {label && <label className="textarea-label">{label}</label>}
      <textarea
        className={`textarea textarea-${variant}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        {...props}
      />
      {error && <span className="textarea-error">{error}</span>}
    </div>
  );
}
