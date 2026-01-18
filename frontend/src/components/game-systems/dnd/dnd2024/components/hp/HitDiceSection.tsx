// D&D 2024 - Hit Dice Section Component (Display only)

interface HitDiceSectionProps {
  hitDice: string;           // d6, d8, d10, d12
  total: number;             // Total hit dice (usually = level)
  used: number;              // Used hit dice
}

export function HitDiceSection({
  hitDice,
  total,
  used,
}: HitDiceSectionProps) {
  const remaining = total - used;

  return (
    <div className="cs-hit-dice-section">
      <div className="cs-hit-dice-header">
        <span className="cs-hit-dice-label">Hit Dice</span>
        <span className="cs-hit-dice-count">{remaining}/{total}</span>
        <span className="cs-hit-dice-type">{hitDice}</span>
      </div>

      <div className="cs-hit-dice-pips">
        {Array.from({ length: total }).map((_, i) => (
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
