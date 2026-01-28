// useAbilities Hook - Ability scores, skills, saving throws, proficiencies

import { updateCharacter } from '../../../../../services/characters.service';
import type { Character, AbilityName, SkillName } from 'shared';

export function useAbilities(character: Character, gameId: string) {
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

  return {
    handleAbilityChange,
    handleSkillProficiencyToggle,
    handleSavingThrowToggle,
    handleArmorTrainingToggle,
    handleWeaponProficienciesChange,
    handleToolProficienciesChange,
  };
}
