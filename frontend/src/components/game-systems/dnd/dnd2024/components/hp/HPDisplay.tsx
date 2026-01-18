// D&D 2024 - HP Display Component (HP and Temp inputs)

import { NumberInput } from '../../../../../shared';

interface HPDisplayProps {
  currentHP: number;
  tempHP: number;
  effectiveMaxHP: number;
  onCurrentHPChange: (value: number) => void;
  onTempHPChange: (value: number) => void;
}

export function HPDisplay({
  currentHP,
  tempHP,
  effectiveMaxHP,
  onCurrentHPChange,
  onTempHPChange,
}: HPDisplayProps) {
  return (
    <div className="cs-hp-display-row">
      <label>HP</label>
      <div className="cs-hp-input-with-suffix">
        <NumberInput
          value={currentHP}
          onChange={onCurrentHPChange}
          min={0}
          max={effectiveMaxHP}
          defaultValue={0}
        />
        <span className="cs-hp-input-suffix">/{effectiveMaxHP}</span>
      </div>

      <label>Temp</label>
      <NumberInput
        value={tempHP}
        onChange={onTempHPChange}
        min={0}
        defaultValue={0}
      />
    </div>
  );
}
