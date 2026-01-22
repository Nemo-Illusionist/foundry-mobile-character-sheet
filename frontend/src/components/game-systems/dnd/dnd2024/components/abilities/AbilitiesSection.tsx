// D&D 2024 - Abilities & Skills Section Component

import { updateCharacter } from '../../../../../../services/characters.service';
import { ABILITY_ORDER } from '../../../core';
import { AbilityBlock } from './AbilityBlock';
import { CompactAbilityBlock } from './CompactAbilityBlock';
import { PassiveSenses } from './PassiveSenses';
import { EquipmentProficiencies } from '../proficiencies';
import type { Character, AbilityName, SkillName } from 'shared';
import './Abilities.scss';

interface AbilitiesSectionProps {
  character: Character;
  gameId: string;
  hideSectionHeader?: boolean;
}

export function AbilitiesSection({ character, gameId, hideSectionHeader }: AbilitiesSectionProps) {
  const handleAbilityChange = async (ability: AbilityName, value: number) => {
    await updateCharacter(gameId, character.id, {
      abilities: {
        ...character.abilities,
        [ability]: Math.max(1, Math.min(30, value)),
      },
    });
  };

  const handleSkillProficiencyToggle = async (skill: SkillName) => {
    const current = character.skills[skill].proficiency;
    const next = current === 2 ? 0 : current + 1;

    await updateCharacter(gameId, character.id, {
      skills: {
        ...character.skills,
        [skill]: { proficiency: next as 0 | 1 | 2 },
      },
    });
  };

  const handleSavingThrowToggle = async (ability: AbilityName) => {
    await updateCharacter(gameId, character.id, {
      savingThrows: {
        ...character.savingThrows,
        [ability]: { proficiency: !character.savingThrows[ability].proficiency },
      },
    });
  };

  const handleArmorTrainingToggle = async (type: 'light' | 'medium' | 'heavy' | 'shields') => {
    const current = character.armorTraining || { light: false, medium: false, heavy: false, shields: false };
    await updateCharacter(gameId, character.id, {
      armorTraining: {
        ...current,
        [type]: !current[type],
      },
    });
  };

  const handleWeaponProficienciesChange = async (value: string) => {
    await updateCharacter(gameId, character.id, {
      weaponProficiencies: value,
    });
  };

  const handleToolProficienciesChange = async (value: string) => {
    await updateCharacter(gameId, character.id, {
      toolProficiencies: value,
    });
  };

  return (
    <>
      {/* Section Header - visible on mobile and tablet when not using unified tabs, hidden on desktop */}
      {!hideSectionHeader && (
        <div className="cs-section-header cs-hide-desktop">
          <h2>Abilities & Skills</h2>
          <button className="cs-section-menu">≡</button>
        </div>
      )}

      {/* Mobile Layout - vertical list */}
      <div className="cs-abilities-skills cs-mobile-only">
        {/* Passive Senses */}
        <PassiveSenses character={character} />

        {ABILITY_ORDER.map((ability) => (
          <AbilityBlock
            key={ability}
            ability={ability}
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />
        ))}
      </div>

      {/* Tablet/Desktop Layout - compact 2-column */}
      <div className="cs-abilities-compact cs-tablet-desktop-only">
        <div className="cs-compact-column">
          {/* Passive Senses */}
          <PassiveSenses character={character} />

          {/* STRENGTH */}
          <CompactAbilityBlock
            ability="str"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />

          {/* CONSTITUTION */}
          <CompactAbilityBlock
            ability="con"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />

          {/* INTELLIGENCE */}
          <CompactAbilityBlock
            ability="int"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />

          {/* CHARISMA */}
          <CompactAbilityBlock
            ability="cha"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />
        </div>

        <div className="cs-compact-column">
          {/* DEXTERITY */}
          <CompactAbilityBlock
            ability="dex"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />

          {/* WISDOM */}
          <CompactAbilityBlock
            ability="wis"
            character={character}
            onAbilityChange={handleAbilityChange}
            onSavingThrowToggle={handleSavingThrowToggle}
            onSkillProficiencyToggle={handleSkillProficiencyToggle}
          />

          {/* Equipment Training & Proficiencies */}
          <EquipmentProficiencies
            character={character}
            onArmorTrainingToggle={handleArmorTrainingToggle}
            onWeaponProficienciesChange={handleWeaponProficienciesChange}
            onToolProficienciesChange={handleToolProficienciesChange}
          />
        </div>
      </div>
    </>
  );
}
