// D&D 2024 - Compact Ability Block Component (Tablet/Desktop Layout)

import { getAbilityModifier, getSkillModifier, getSavingThrowModifier } from '../../../core/utils/calculations';
import { ABILITY_NAMES, SKILLS_BY_ABILITY } from '../../../core/constants';
import type { Character, AbilityName, SkillName } from 'shared';

interface CompactAbilityBlockProps {
  ability: AbilityName;
  character: Character;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onSavingThrowToggle: (ability: AbilityName) => void;
  onSkillProficiencyToggle: (skill: SkillName) => void;
}

export function CompactAbilityBlock({
  ability,
  character,
  onAbilityChange,
  onSavingThrowToggle,
  onSkillProficiencyToggle,
}: CompactAbilityBlockProps) {
  const score = character.abilities[ability];
  const modifier = getAbilityModifier(score);
  const saveModifier = getSavingThrowModifier(character, ability, character.proficiencyBonus);
  const saveProficient = character.savingThrows[ability].proficiency;
  const skills = SKILLS_BY_ABILITY[ability];

  return (
    <div className="cs-compact-ability">
      {/* Ability Header: Name + Score + Modifiers */}
      <div className="cs-compact-ability-header">
        <div className="cs-compact-ability-title">
          <h3 className="cs-compact-ability-name">{ABILITY_NAMES[ability].toUpperCase()}</h3>
          <input
            type="number"
            className="cs-compact-ability-score"
            value={score}
            onChange={(e) => onAbilityChange(ability, parseInt(e.target.value) || 10)}
            min="1"
            max="30"
          />
        </div>
        <div className="cs-compact-modifiers">
          <div className="cs-compact-modifier-box">
            <span className="cs-compact-modifier-label">Check</span>
            <span className="cs-compact-modifier-value">
              {modifier >= 0 ? '+' : ''}{modifier}
            </span>
          </div>
          <div
            className={`cs-compact-modifier-box cs-save ${saveProficient ? 'proficient' : ''}`}
            onClick={() => onSavingThrowToggle(ability)}
          >
            <span className="cs-compact-modifier-label">Save</span>
            <span className="cs-compact-modifier-value">
              {saveModifier >= 0 ? '+' : ''}{saveModifier}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="cs-compact-skills">
          {skills.map((skill) => {
            const skillMod = getSkillModifier(character, skill, character.proficiencyBonus);
            const proficiency = character.skills[skill].proficiency;

            return (
              <div
                key={skill}
                className={`cs-compact-skill-row proficiency-${proficiency}`}
                onClick={() => onSkillProficiencyToggle(skill)}
              >
                <div className="cs-compact-skill-indicator">
                  {proficiency === 2 ? '◉' : proficiency === 1 ? '●' : '○'}
                </div>
                <span className="cs-compact-skill-name">{skill}</span>
                <span className="cs-compact-skill-modifier">
                  {skillMod >= 0 ? '+' : ''}{skillMod}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
