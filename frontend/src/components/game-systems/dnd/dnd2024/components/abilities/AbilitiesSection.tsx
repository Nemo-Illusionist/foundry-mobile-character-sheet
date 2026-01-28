// D&D 2024 - Abilities & Skills Section Component

import { ABILITY_ORDER } from '../../../core';
import { useAbilities } from '../../hooks';
import { AbilityBlock } from './AbilityBlock';
import { CompactAbilityBlock } from './CompactAbilityBlock';
import { PassiveSenses } from './PassiveSenses';
import { EquipmentProficiencies } from '../proficiencies';
import type { Character } from 'shared';
import './Abilities.scss';

interface AbilitiesSectionProps {
  character: Character;
  gameId: string;
  hideSectionHeader?: boolean;
}

export function AbilitiesSection({ character, gameId, hideSectionHeader }: AbilitiesSectionProps) {
  const {
    handleAbilityChange,
    handleSkillProficiencyToggle,
    handleSavingThrowToggle,
    handleArmorTrainingToggle,
    handleWeaponProficienciesChange,
    handleToolProficienciesChange,
  } = useAbilities(character, gameId);

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
