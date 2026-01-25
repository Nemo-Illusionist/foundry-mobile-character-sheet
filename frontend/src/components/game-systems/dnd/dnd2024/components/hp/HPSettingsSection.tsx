// D&D 2024 - HP Settings Section Component

import { useState } from 'react';
import { NumberInput } from '../../../../../shared';

interface HPSettingsSectionProps {
  maxHP: number;
  hpBonus: number;
  hitDice: string;
  hitDiceUsed: number;
  hitDiceTotal: number;
  onMaxHPChange: (value: number) => void;
  onHPBonusChange: (value: number) => void;
  onHitDiceChange: (value: string) => void;
  onHitDiceUsedChange: (value: number) => void;
  showHitDiceSettings?: boolean; // Hide hit dice for multiclass (managed in Class tab)
}

export function HPSettingsSection({
  maxHP,
  hpBonus,
  hitDice,
  hitDiceUsed,
  hitDiceTotal,
  onMaxHPChange,
  onHPBonusChange,
  onHitDiceChange,
  onHitDiceUsedChange,
  showHitDiceSettings = true,
}: HPSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hitDiceRemaining = hitDiceTotal - hitDiceUsed;

  const handleRemainingChange = (newRemaining: number) => {
    const newUsed = hitDiceTotal - newRemaining;
    onHitDiceUsedChange(newUsed);
  };

  return (
    <div className="cs-hp-modal-settings">
      <button
        className="cs-hp-settings-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? '▼' : '▶'} HP Settings
      </button>
      {isExpanded && (
        <div className="cs-hp-settings-grid">
          {/* Row 1: Max | input | Bonus | input */}
          <label>Max</label>
          <NumberInput
            value={maxHP}
            onChange={onMaxHPChange}
            min={1}
            defaultValue={1}
          />
          <label>Bonus</label>
          <NumberInput
            value={hpBonus}
            onChange={onHPBonusChange}
            defaultValue={0}
          />

          {/* Row 2: Dice | select | Left | input with suffix (hidden for multiclass) */}
          {showHitDiceSettings && (
            <>
              <label>Dice</label>
              <select
                className="cs-hp-settings-select"
                value={hitDice}
                onChange={(e) => onHitDiceChange(e.target.value)}
              >
                <option value="d6">d6</option>
                <option value="d8">d8</option>
                <option value="d10">d10</option>
                <option value="d12">d12</option>
              </select>
              <label>Left</label>
              <div className="cs-hp-input-with-suffix">
                <NumberInput
                  value={hitDiceRemaining}
                  onChange={handleRemainingChange}
                  min={0}
                  max={hitDiceTotal}
                  defaultValue={hitDiceTotal}
                />
                <span className="cs-hp-input-suffix">/{hitDiceTotal}</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
