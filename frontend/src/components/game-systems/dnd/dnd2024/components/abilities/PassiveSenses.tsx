// D&D 2024 - Passive Senses Component

import { getSkillModifier } from '../../../core';
import type { Character } from 'shared';

interface PassiveSensesProps {
  character: Character;
}

export function PassiveSenses({ character }: PassiveSensesProps) {
  const profBonus = character.proficiencyBonus;

  // Passive = 10 + skill modifier
  const passivePerception = 10 + getSkillModifier(character, 'Perception', profBonus);
  const passiveInvestigation = 10 + getSkillModifier(character, 'Investigation', profBonus);
  const passiveInsight = 10 + getSkillModifier(character, 'Insight', profBonus);

  return (
    <div className="cs-passive-senses">
      <div className="cs-passive-header">Passive Senses</div>
      <div className="cs-passive-grid">
        <div className="cs-passive-item">
          <span className="cs-passive-value">{passivePerception}</span>
          <span className="cs-passive-label">Perception</span>
        </div>
        <div className="cs-passive-item">
          <span className="cs-passive-value">{passiveInvestigation}</span>
          <span className="cs-passive-label">Investigation</span>
        </div>
        <div className="cs-passive-item">
          <span className="cs-passive-value">{passiveInsight}</span>
          <span className="cs-passive-label">Insight</span>
        </div>
      </div>
    </div>
  );
}
