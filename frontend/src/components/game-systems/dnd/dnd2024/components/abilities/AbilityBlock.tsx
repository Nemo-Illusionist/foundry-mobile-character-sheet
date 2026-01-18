// D&D 2024 - Ability Block Component (Mobile Layout)

import { NumberInput } from '../../../../../shared';
import { getAbilityModifier, getSkillModifier, getSavingThrowModifier, ABILITY_NAMES, SKILLS_BY_ABILITY } from '../../../core';
import type { Character, AbilityName, SkillName } from 'shared';

interface AbilityBlockProps {
  ability: AbilityName;
  character: Character;
  onAbilityChange: (ability: AbilityName, value: number) => void;
  onSavingThrowToggle: (ability: AbilityName) => void;
  onSkillProficiencyToggle: (skill: SkillName) => void;
}

export function AbilityBlock({
  ability,
  character,
  onAbilityChange,
  onSavingThrowToggle,
  onSkillProficiencyToggle,
}: AbilityBlockProps) {
  const score = character.abilities[ability];
  const modifier = getAbilityModifier(score);
  const saveModifier = getSavingThrowModifier(character, ability, character.proficiencyBonus);
  const saveProficient = character.savingThrows[ability].proficiency;
  const skills = SKILLS_BY_ABILITY[ability];

  return (
    <div className="cs-ability-block">
      {/* Ability Header: Name + Score + Modifiers (unified) */}
      <div className="cs-ability-header">
        <div className="cs-ability-title">
          <h3 className="cs-ability-name">{ABILITY_NAMES[ability].toUpperCase()}</h3>
          <NumberInput
            className="cs-ability-score"
            value={score}
            onChange={(val) => onAbilityChange(ability, val)}
            min={1}
            max={30}
            defaultValue={10}
          />
        </div>
        <div className="cs-ability-modifiers">
          <div className="cs-modifier-box">
            <span className="cs-modifier-label">Check</span>
            <span className="cs-modifier-value">
              {modifier >= 0 ? '+' : ''}{modifier}
            </span>
          </div>
          <div
            className={`cs-modifier-box cs-save ${saveProficient ? 'proficient' : ''}`}
            onClick={() => onSavingThrowToggle(ability)}
          >
            <span className="cs-modifier-label">Save</span>
            <span className="cs-modifier-value">
              {saveModifier >= 0 ? '+' : ''}{saveModifier}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="cs-skills-list">
          {skills.map((skill) => {
            const skillMod = getSkillModifier(character, skill, character.proficiencyBonus);
            const proficiency = character.skills[skill].proficiency;

            return (
              <div
                key={skill}
                className={`cs-skill-row proficiency-${proficiency}`}
                onClick={() => onSkillProficiencyToggle(skill)}
              >
                <div className="cs-skill-indicator">
                  {proficiency === 2 ? '◉' : proficiency === 1 ? '●' : '○'}
                </div>
                <span className="cs-skill-name">{skill}</span>
                <span className="cs-skill-modifier">
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
