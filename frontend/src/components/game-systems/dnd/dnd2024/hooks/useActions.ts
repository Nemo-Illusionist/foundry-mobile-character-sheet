// useActions Hook - CRUD and computed display for character actions

import { useState } from 'react';
import { updateCharacter } from '../../../../../services/characters.service';
import { getAbilityModifier } from '../../core';
import { generateId } from '../utils';
import type { Character, CharacterAction } from 'shared';

const ACTION_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'action', label: 'Action' },
  { id: 'bonus', label: 'Bonus' },
  { id: 'reaction', label: 'Reaction' },
  { id: 'free', label: 'Free' },
  { id: 'other', label: 'Other' },
] as const;

type FilterType = typeof ACTION_FILTERS[number]['id'];

export function useActions(character: Character, gameId: string) {
  const [editingAction, setEditingAction] = useState<CharacterAction | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const actions = character.actions || [];

  const filteredActions = filter === 'all'
    ? actions
    : actions.filter((action) => action.actionType === filter);

  const addAction = async () => {
    const newAction: CharacterAction = {
      id: generateId(),
      name: 'New Action',
      actionType: 'action',
    };
    await updateCharacter(gameId, character.id, {
      actions: [...actions, newAction],
    });
    setEditingAction(newAction);
  };

  const updateAction = async (id: string, updates: Partial<CharacterAction>) => {
    const updatedActions = actions.map((a) =>
      a.id === id ? { ...a, ...updates } : a
    );
    await updateCharacter(gameId, character.id, {
      actions: updatedActions,
    });
  };

  const deleteAction = async (id: string) => {
    setEditingAction(null);
    await updateCharacter(gameId, character.id, {
      actions: actions.filter((a) => a.id !== id),
    });
  };

  const getAttackBonus = (action: CharacterAction): string => {
    if (!action.ability) return '—';

    const abilityMod = getAbilityModifier(character.abilities[action.ability]);
    const profBonus = action.proficient ? character.proficiencyBonus : 0;
    const extra = action.extraBonus || 0;
    const total = abilityMod + profBonus + extra;

    return total >= 0 ? `+${total}` : `${total}`;
  };

  const getDamageDisplay = (action: CharacterAction): string => {
    if (!action.damage) return '—';

    const bonus = action.damageBonus || 0;
    if (bonus === 0) return action.damage;
    return bonus > 0 ? `${action.damage}+${bonus}` : `${action.damage}${bonus}`;
  };

  return {
    // State
    editingAction,
    setEditingAction,
    filter,
    setFilter,
    // Computed
    actions,
    filteredActions,
    // Handlers
    addAction,
    updateAction,
    deleteAction,
    getAttackBonus,
    getDamageDisplay,
    // Constants
    ACTION_FILTERS,
  };
}
