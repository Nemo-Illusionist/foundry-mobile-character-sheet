// D&D 2024 - HP Settings Section Component
// Supports multiclass with per-class hit dice settings

import React, { useState } from 'react';
import { NumberInput } from '../../../../../shared';
import type { HitDiceGroup } from '../../utils';

interface HPSettingsSectionProps {
  maxHP: number;
  hpBonus: number;
  onMaxHPChange: (value: number) => void;
  onHPBonusChange: (value: number) => void;
  // Multiclass mode
  hitDiceGroups?: HitDiceGroup[];
  onHitDiceUsedChange?: (diceType: string, newUsed: number) => void;
}

export function HPSettingsSection({
  maxHP,
  hpBonus,
  onMaxHPChange,
  onHPBonusChange,
  hitDiceGroups,
  onHitDiceUsedChange,
}: HPSettingsSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleRemainingChange = (diceType: string, total: number, newRemaining: number) => {
    const newUsed = total - newRemaining;
    onHitDiceUsedChange?.(diceType, newUsed);
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
          {/* Row 1: Max HP */}
          <label>Max</label>
          <NumberInput
            value={maxHP}
            onChange={onMaxHPChange}
            min={1}
            defaultValue={1}
          />

          {/* Row 1: HP Bonus */}
          <label>Bonus</label>
          <NumberInput
            value={hpBonus}
            onChange={onHPBonusChange}
            defaultValue={0}
          />

          {/* Hit Dice rows - label spans columns 1-3, input in column 4 */}
          {hitDiceGroups && hitDiceGroups.map((group) => {
            const remaining = group.total - group.used;
            return (
              <React.Fragment key={group.type}>
                {/* Label spanning columns 1-3 */}
                <label className="cs-hp-hitdice-label">
                  Hit Dice: {group.className ? `${group.className} ${group.type}` : group.type}
                </label>
                {/* Input with /total suffix in column 4 */}
                <div className="cs-hp-input-with-suffix">
                  <NumberInput
                    value={remaining}
                    onChange={(newRemaining) => handleRemainingChange(group.type, group.total, newRemaining)}
                    min={0}
                    max={group.total}
                    defaultValue={group.total}
                  />
                  <span className="cs-hp-input-suffix">/{group.total}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
