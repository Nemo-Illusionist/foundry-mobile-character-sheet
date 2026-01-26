// Custom hook for Level & XP management
// Shared between ClassTab and LevelXPModal

import { useState, useEffect } from 'react';
import { updateCharacter } from '../../../../../services/characters.service';
import {
  XP_THRESHOLDS,
  calculateLevelFromXP,
  getProficiencyBonus,
  getSpellSlotsForCharacter,
  getWarlockPactMagic,
} from '../constants';
import { getClasses, isMulticlass } from '../utils';
import type { Character, CharacterClass } from 'shared';

interface UseLevelXPOptions {
  // If true, messages will mention "Class tab" for multiclass
  showClassTabHint?: boolean;
}

export function useLevelXP(
  character: Character,
  gameId: string,
  options: UseLevelXPOptions = {}
) {
  const { showClassTabHint = false } = options;

  const [currentXP, setCurrentXP] = useState(character.experience || 0);
  const [gainXPInput, setGainXPInput] = useState(0);
  const [message, setMessage] = useState('');

  const classes = getClasses(character);
  const hasMultipleClasses = isMulticlass(character);

  // Sync currentXP with character.experience when it changes
  useEffect(() => {
    setCurrentXP(character.experience || 0);
  }, [character.experience]);

  // Computed values
  const globalLevel = calculateLevelFromXP(currentXP);
  const totalClassLevels = classes.reduce((sum, c) => sum + c.level, 0);
  const nextLevelXP = globalLevel < 20 ? XP_THRESHOLDS[globalLevel] : null;
  const xpToNextLevel = nextLevelXP ? nextLevelXP - currentXP : null;

  // Helper: Calculate spell slots update for multiclass
  const getSpellSlotsUpdate = (updatedClasses: CharacterClass[]) => {
    const hasAutoSlots = updatedClasses.some(c =>
      c.spellcasterType === 'full' ||
      c.spellcasterType === 'half' ||
      c.spellcasterType === 'third' ||
      c.spellcasterType === 'warlock'
    );

    if (hasAutoSlots) {
      return getSpellSlotsForCharacter(updatedClasses);
    }
    return undefined;
  };

  // Helper: Get Pact Magic update if warlock leveled up
  const getPactMagicUpdate = (updatedClasses: CharacterClass[]) => {
    const warlockClass = updatedClasses.find(c => c.spellcasterType === 'warlock');
    if (warlockClass) {
      const pactMagic = getWarlockPactMagic(warlockClass.level);
      if (pactMagic) {
        return {
          pactMagicSlots: {
            current: pactMagic.slots,
            max: pactMagic.slots,
            level: pactMagic.level,
          },
        };
      }
    }
    return {};
  };

  // Level up: increases global level (XP), auto-increases class only if single class
  const handleLevelUp = async () => {
    if (globalLevel >= 20) {
      setMessage('Maximum level reached!');
      return;
    }

    const newGlobalLevel = globalLevel + 1;
    const newXP = XP_THRESHOLDS[globalLevel]; // XP needed for next level

    // For multiclass, only increase global level (user allocates class levels manually)
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: newXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });
      setCurrentXP(newXP);
      const unallocated = newGlobalLevel - totalClassLevels;
      if (showClassTabHint) {
        setMessage(`Level ${newGlobalLevel}! ${unallocated} level(s) to allocate in Class tab.`);
      } else {
        setMessage(`Level ${newGlobalLevel}!`);
      }
      return;
    }

    // Single class - also increase class level
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setCurrentXP(newXP);
    setMessage(`Level ${newGlobalLevel}!`);
  };

  // Handle XP change (single class auto-levels class to match global)
  const handleXPChange = async () => {
    const newGlobalLevel = calculateLevelFromXP(currentXP);

    // For multiclass, don't auto-change class levels - user does it manually
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: currentXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });

      if (showClassTabHint) {
        const diff = newGlobalLevel - totalClassLevels;
        if (diff > 0) {
          setMessage(`Level ${newGlobalLevel}! ${diff} level(s) to allocate in Class tab.`);
        } else if (diff < 0) {
          setMessage(`Level ${newGlobalLevel}! Class levels exceed by ${-diff}. Reduce in Class tab.`);
        } else {
          setMessage('XP updated.');
        }
      } else {
        setMessage(newGlobalLevel !== globalLevel ? `Level ${newGlobalLevel}!` : 'XP updated.');
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: currentXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setMessage(newGlobalLevel !== globalLevel ? `Level ${newGlobalLevel}!` : 'XP updated.');
  };

  // Handle gaining XP (single class auto-levels class to match global)
  const handleGainXP = async () => {
    if (gainXPInput <= 0) return;

    const newXP = currentXP + gainXPInput;
    const newGlobalLevel = calculateLevelFromXP(newXP);
    const xpGained = gainXPInput;

    setCurrentXP(newXP);
    setGainXPInput(0);

    // For multiclass, don't auto-level class
    if (hasMultipleClasses) {
      await updateCharacter(gameId, character.id, {
        experience: newXP,
        level: newGlobalLevel,
        proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      });

      if (showClassTabHint) {
        const diff = newGlobalLevel - totalClassLevels;
        if (diff > 0) {
          setMessage(`+${xpGained} XP! Level ${newGlobalLevel}! ${diff} level(s) to allocate.`);
        } else {
          setMessage(`+${xpGained} XP!`);
        }
      } else {
        setMessage(newGlobalLevel !== globalLevel ? `+${xpGained} XP! Level ${newGlobalLevel}!` : `+${xpGained} XP!`);
      }
      return;
    }

    // Single class - auto-level class to match global
    const updatedClasses = [...classes];
    updatedClasses[0] = { ...updatedClasses[0], level: newGlobalLevel };
    const spellSlotsUpdate = getSpellSlotsUpdate(updatedClasses);
    const pactMagicUpdate = getPactMagicUpdate(updatedClasses);

    await updateCharacter(gameId, character.id, {
      classes: updatedClasses,
      experience: newXP,
      level: newGlobalLevel,
      proficiencyBonus: getProficiencyBonus(newGlobalLevel),
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
      ...pactMagicUpdate,
    });
    setMessage(newGlobalLevel !== globalLevel ? `+${xpGained} XP! Level ${newGlobalLevel}!` : `+${xpGained} XP!`);
  };

  // Clear message
  const clearMessage = () => setMessage('');

  return {
    // State
    currentXP,
    setCurrentXP,
    gainXPInput,
    setGainXPInput,
    message,
    setMessage,
    clearMessage,

    // Computed
    classes,
    hasMultipleClasses,
    globalLevel,
    totalClassLevels,
    nextLevelXP,
    xpToNextLevel,

    // Handlers
    handleLevelUp,
    handleXPChange,
    handleGainXP,
  };
}
