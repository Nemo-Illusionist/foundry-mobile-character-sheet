// StatBox Component - Rectangular box with label + value
// Used for Initiative, Inspiration, AC, Proficiency, Speed, etc.

import { ReactNode } from 'react';
import './StatBox.scss';

interface StatBoxProps {
  label: string;
  value: string | number | ReactNode;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'bordered' | 'filled';
  className?: string;
}

export function StatBox({
  label,
  value,
  onClick,
  size = 'md',
  variant = 'default',
  className = '',
}: StatBoxProps) {
  const isClickable = !!onClick;

  return (
    <div
      className={`stat-box stat-box-${size} stat-box-${variant} ${isClickable ? 'stat-box-clickable' : ''} ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
    >
      <div className="stat-box-value">{value}</div>
      <div className="stat-box-label">{label}</div>
    </div>
  );
}
