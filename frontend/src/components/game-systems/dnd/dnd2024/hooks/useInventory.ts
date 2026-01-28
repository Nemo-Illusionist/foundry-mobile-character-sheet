// useInventory Hook - CRUD, currency, weight, filtering for inventory items

import { useState } from 'react';
import { updateCharacter } from '../../../../../services/characters.service';
import { generateId } from '../utils';
import type { Character, InventoryItem } from 'shared';

const ITEM_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'weapon', label: 'Wpn' },
  { id: 'armor', label: 'Armor' },
  { id: 'gear', label: 'Gear' },
  { id: 'consumable', label: 'Cons' },
  { id: 'treasure', label: 'Treas' },
  { id: 'other', label: 'Other' },
] as const;

type FilterType = typeof ITEM_TYPES[number]['id'];

export function useInventory(character: Character, gameId: string) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const items = character.inventoryItems || [];

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.type === filter);

  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight || 0) * (item.quantity ?? 1);
  }, 0);

  const addItem = async () => {
    const newItem: InventoryItem = {
      id: generateId(),
      name: 'New Item',
      type: 'gear',
    };
    await updateCharacter(gameId, character.id, {
      inventoryItems: [...items, newItem],
    });
    setEditingItem(newItem);
  };

  const updateItem = async (id: string, updates: Partial<InventoryItem>) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await updateCharacter(gameId, character.id, {
      inventoryItems: updatedItems,
    });
  };

  const deleteItem = async (id: string) => {
    setEditingItem(null);
    await updateCharacter(gameId, character.id, {
      inventoryItems: items.filter((item) => item.id !== id),
    });
  };

  const toggleEquipped = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = items.find((i) => i.id === id);
    if (item) {
      await updateItem(id, { equipped: !item.equipped });
    }
  };

  const updateCurrency = async (coin: keyof typeof character.currency, value: number) => {
    await updateCharacter(gameId, character.id, {
      currency: { ...character.currency, [coin]: value },
    });
  };

  return {
    // State
    editingItem,
    setEditingItem,
    filter,
    setFilter,
    // Computed
    items,
    filteredItems,
    totalWeight,
    // Handlers
    addItem,
    updateItem,
    deleteItem,
    toggleEquipped,
    updateCurrency,
    // Constants
    ITEM_TYPES,
  };
}
