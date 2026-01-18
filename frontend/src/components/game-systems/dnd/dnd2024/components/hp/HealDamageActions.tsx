// D&D 2024 - Heal/Damage Actions Component

import { NumberInput } from '../../../../../shared';

interface HealDamageActionsProps {
  amount: number;
  onAmountChange: (value: number) => void;
  onHeal: () => void;
  onDamage: () => void;
}

export function HealDamageActions({
  amount,
  onAmountChange,
  onHeal,
  onDamage,
}: HealDamageActionsProps) {
  return (
    <div className="cs-hp-modal-actions">
      <button className="cs-hp-btn-heal" onClick={onHeal}>
        Heal
      </button>
      <NumberInput
        value={amount}
        onChange={onAmountChange}
        min={0}
        defaultValue={0}
        placeholder="Amount"
      />
      <button className="cs-hp-btn-damage" onClick={onDamage}>
        Damage
      </button>
    </div>
  );
}
