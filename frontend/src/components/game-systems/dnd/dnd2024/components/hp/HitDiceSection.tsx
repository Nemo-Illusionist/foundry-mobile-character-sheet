// D&D 2024 - Hit Dice Section Component (Display only)
// Supports multiclass with grouped hit dice by type

import type { HitDiceGroup } from '../../utils';

interface HitDiceSectionProps {
  // Single class mode (legacy)
  hitDice?: string;
  total?: number;
  used?: number;
  // Multiclass mode
  groups?: HitDiceGroup[];
}

export function HitDiceSection({
  hitDice,
  total,
  used,
  groups,
}: HitDiceSectionProps) {
  // If groups provided, use multiclass display
  if (groups && groups.length > 0) {
    return (
      <div className="cs-hit-dice-section cs-hit-dice-multiclass">
        <div className="cs-hit-dice-header">
          <span className="cs-hit-dice-label">Hit Dice</span>
        </div>
        <div className="cs-hit-dice-groups">
          {groups.map((group) => {
            const remaining = group.total - group.used;
            return (
              <div key={group.type} className="cs-hit-dice-group">
                <div className="cs-hit-dice-group-header">
                  <span className="cs-hit-dice-type">{group.type}</span>
                  <span className="cs-hit-dice-count">{remaining}/{group.total}</span>
                </div>
                <div className="cs-hit-dice-pips">
                  {Array.from({ length: group.total }).map((_, i) => (
                    <div
                      key={i}
                      className={`cs-hit-dice-pip ${i < remaining ? 'available' : 'used'}`}
                      title={i < remaining ? 'Available' : 'Used'}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Single class mode (legacy)
  const remaining = (total || 0) - (used || 0);

  return (
    <div className="cs-hit-dice-section">
      <div className="cs-hit-dice-header">
        <span className="cs-hit-dice-label">Hit Dice</span>
        <span className="cs-hit-dice-count">{remaining}/{total || 0}</span>
        <span className="cs-hit-dice-type">{hitDice || 'd8'}</span>
      </div>

      <div className="cs-hit-dice-pips">
        {Array.from({ length: total || 0 }).map((_, i) => (
          <div
            key={i}
            className={`cs-hit-dice-pip ${i < remaining ? 'available' : 'used'}`}
            title={i < remaining ? 'Available' : 'Used'}
          />
        ))}
      </div>
    </div>
  );
}
