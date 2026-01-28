// useSpells Hook - CRUD, slot management, spellcasting stats, filtering

import { useState } from 'react';
import { updateCharacter } from '../../../../../services/characters.service';
import { generateId, calculateSpellStats, getSpellcastingClasses } from '../utils';
import type { Character, CharacterSpellEntry, AbilityName } from 'shared';

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

type FilterType = 'all' | 'prepared' | 'ritual';

export function useSpells(character: Character, gameId: string) {
  const [editingSpell, setEditingSpell] = useState<CharacterSpellEntry | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1]));

  const spellcastingClasses = getSpellcastingClasses(character);
  const spells = character.spellEntries || [];
  const spellSlots = character.spellSlots || {};
  const pactMagicSlots = character.pactMagicSlots;

  // Get unique spellcasting abilities from all classes (including warlock)
  const spellcastingAbilities = [...new Set(
    spellcastingClasses
      .map(c => c.spellcastingAbility || (c.spellcasterType === 'warlock' ? 'cha' : 'int'))
  )] as AbilityName[];

  // For spell display, use primary (first) ability
  const primaryAbility: AbilityName = spellcastingAbilities[0] || 'int';
  const { spellSaveDC, spellAttackBonus } = calculateSpellStats(character, primaryAbility);

  // Filter spells
  const filteredSpells = spells.filter((spell) => {
    if (filter === 'prepared') return spell.prepared || spell.level === 0;
    if (filter === 'ritual') return spell.ritual;
    return true;
  });

  // Group spells by level
  const spellsByLevel = SPELL_LEVELS.reduce((acc, level) => {
    acc[level] = filteredSpells.filter((s) => s.level === level);
    return acc;
  }, {} as Record<number, CharacterSpellEntry[]>);

  // Count prepared spells (excluding cantrips)
  const preparedCount = spells.filter((s) => s.prepared && s.level > 0).length;

  // Calculate stats for each spellcasting ability
  const abilityStats = spellcastingAbilities.map(ability => ({
    ability,
    ...calculateSpellStats(character, ability),
  }));

  const toggleLevel = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const addSpell = async (level: number = 0) => {
    const newSpell: CharacterSpellEntry = {
      id: generateId(),
      name: 'New Spell',
      level,
      prepared: level === 0, // Cantrips are always prepared
    };
    await updateCharacter(gameId, character.id, {
      spellEntries: [...spells, newSpell],
    });
    setEditingSpell(newSpell);
  };

  const updateSpell = async (id: string, updates: Partial<CharacterSpellEntry>) => {
    const updatedSpells = spells.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    await updateCharacter(gameId, character.id, {
      spellEntries: updatedSpells,
    });
  };

  const deleteSpell = async (id: string) => {
    setEditingSpell(null);
    await updateCharacter(gameId, character.id, {
      spellEntries: spells.filter((s) => s.id !== id),
    });
  };

  const useSpellSlot = async (level: number, delta: number) => {
    const slot = spellSlots[level] || { current: 0, max: 0 };
    const newCurrent = Math.max(0, Math.min(slot.max, slot.current + delta));
    await updateCharacter(gameId, character.id, {
      spellSlots: {
        ...spellSlots,
        [level]: { ...slot, current: newCurrent },
      },
    });
  };

  const usePactMagicSlot = async (delta: number) => {
    if (!pactMagicSlots) return;
    const newCurrent = Math.max(0, Math.min(pactMagicSlots.max, pactMagicSlots.current + delta));
    await updateCharacter(gameId, character.id, {
      pactMagicSlots: { ...pactMagicSlots, current: newCurrent },
    });
  };

  return {
    // State
    editingSpell,
    setEditingSpell,
    filter,
    setFilter,
    expandedLevels,
    toggleLevel,
    // Data
    spells,
    spellSlots,
    pactMagicSlots,
    filteredSpells,
    spellsByLevel,
    preparedCount,
    // Spellcasting stats
    spellcastingAbilities,
    spellSaveDC,
    spellAttackBonus,
    abilityStats,
    // Handlers
    addSpell,
    updateSpell,
    deleteSpell,
    useSpellSlot,
    usePactMagicSlot,
  };
}
