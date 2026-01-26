// ValueWithMax Component - Input displaying [value / max]
// Used for HP Settings hit dice, spell slots, etc.

import { NumberInput } from './NumberInput';
import './ValueWithMax.scss';

interface ValueWithMaxProps {
  value: number;
  max: number;
  onChange: (value: number) => void;
  min?: number;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function ValueWithMax({
  value,
  max,
  onChange,
  min = 0,
  label,
  size = 'md',
  className = '',
}: ValueWithMaxProps) {
  return (
    <div className={`value-with-max value-with-max-${size} ${className}`}>
      {label && <span className="value-with-max-label">{label}</span>}
      <div className="value-with-max-input">
        <NumberInput
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          defaultValue={max}
          className="value-with-max-number"
        />
        <span className="value-with-max-separator">/</span>
        <span className="value-with-max-total">{max}</span>
      </div>
    </div>
  );
}
