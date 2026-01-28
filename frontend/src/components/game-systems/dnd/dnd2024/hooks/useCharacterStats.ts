// useCharacterStats Hook - Inspiration, exhaustion, initiative, conditions logic

import { useCharacterMutation } from '../../../../../hooks';
import { getAbilityModifier } from '../../core';
import type { Character } from 'shared';

export function useCharacterStats(character: Character, gameId: string) {
  const { update } = useCharacterMutation(gameId, character);

  const dexModifier = getAbilityModifier(character.abilities.dex);
  const displayedInitiative = character.initiativeOverride ?? dexModifier;
  const activeConditions = character.conditions || [];
  const conditionsCount = activeConditions.length;
  const totalAC = character.ac + (character.shield || 0);

  const handleInspirationToggle = async () => {
    await update({ inspiration: !character.inspiration });
  };

  const handleExhaustionChange = async (level: number) => {
    await update({ exhaustion: level });
  };

  return {
    displayedInitiative,
    activeConditions,
    conditionsCount,
    totalAC,
    handleInspirationToggle,
    handleExhaustionChange,
  };
}
