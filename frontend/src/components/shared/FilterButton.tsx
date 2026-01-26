// FilterButton Component - Group of filter buttons
// Used for SpellsTab, InventoryTab, ActionsTab filters

import './FilterButton.scss';

interface FilterOption<T extends string> {
  id: T;
  label: string;
  count?: number;
}

interface FilterButtonProps<T extends string> {
  options: FilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
  className?: string;
}

export function FilterButton<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  className = '',
}: FilterButtonProps<T>) {
  return (
    <div className={`filter-button-group filter-button-${size} ${className}`}>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          className={`filter-button ${value === option.id ? 'active' : ''}`}
          onClick={() => onChange(option.id)}
        >
          {option.label}
          {option.count !== undefined && (
            <span className="filter-button-count">({option.count})</span>
          )}
        </button>
      ))}
    </div>
  );
}
