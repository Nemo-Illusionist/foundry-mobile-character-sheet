// IconButton Component - Button with icon (+/-/×)
// Used for HP modal +/-, Class level +/-, Close buttons

import { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.scss';

type IconType = '+' | '-' | '×' | 'close' | ReactNode;

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  icon: IconType;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'danger' | 'success' | 'primary';
  'aria-label'?: string;
}

const ICON_MAP: Record<string, string> = {
  '+': '+',
  '-': '−', // Use proper minus sign
  '×': '×',
  'close': '×',
};

export function IconButton({
  icon,
  size = 'md',
  variant = 'default',
  className = '',
  disabled,
  'aria-label': ariaLabel,
  ...props
}: IconButtonProps) {
  const iconContent = typeof icon === 'string' && ICON_MAP[icon] ? ICON_MAP[icon] : icon;

  return (
    <button
      type="button"
      className={`icon-button icon-button-${size} icon-button-${variant} ${className}`}
      disabled={disabled}
      aria-label={ariaLabel || (typeof icon === 'string' ? icon : undefined)}
      {...props}
    >
      {iconContent}
    </button>
  );
}
