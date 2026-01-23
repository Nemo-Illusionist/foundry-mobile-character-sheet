// D&D 2024 - Inventory Tab Component

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { InventoryItemModal } from './InventoryItemModal';
import type { Character, InventoryItem } from 'shared';

interface InventoryTabProps {
  character: Character;
  gameId: string;
}

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

export function InventoryTab({ character, gameId }: InventoryTabProps) {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  const items = character.inventoryItems || [];

  const filteredItems = filter === 'all'
    ? items
    : items.filter((item) => item.type === filter);

  const generateId = () => Math.random().toString(36).substring(2, 9);

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
    // Close modal immediately for responsive UI
    setEditingItem(null);
    // Delete in background
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

  // Calculate total weight (treat undefined quantity as 1)
  const totalWeight = items.reduce((sum, item) => {
    return sum + (item.weight || 0) * (item.quantity ?? 1);
  }, 0);

  const updateCurrency = async (coin: keyof typeof character.currency, value: number) => {
    await updateCharacter(gameId, character.id, {
      currency: { ...character.currency, [coin]: value },
    });
  };

  return (
    <div className="cs-inventory-tab">
      {/* Coins section */}
      <div className="cs-coins-section">
        <div className="cs-coins-title">Coins</div>
        <div className="cs-coins-grid">
          <label>CP</label>
          <label>SP</label>
          <label>EP</label>
          <label>GP</label>
          <label>PP</label>
          <input
            type="number"
            value={character.currency.cp}
            onChange={(e) => updateCurrency('cp', Number(e.target.value) || 0)}
            min={0}
          />
          <input
            type="number"
            value={character.currency.sp}
            onChange={(e) => updateCurrency('sp', Number(e.target.value) || 0)}
            min={0}
          />
          <input
            type="number"
            value={character.currency.ep}
            onChange={(e) => updateCurrency('ep', Number(e.target.value) || 0)}
            min={0}
          />
          <input
            type="number"
            value={character.currency.gp}
            onChange={(e) => updateCurrency('gp', Number(e.target.value) || 0)}
            min={0}
          />
          <input
            type="number"
            value={character.currency.pp}
            onChange={(e) => updateCurrency('pp', Number(e.target.value) || 0)}
            min={0}
          />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="cs-tab-filters">
        {ITEM_TYPES.map((type) => (
          <button
            key={type.id}
            className={`cs-filter-btn ${filter === type.id ? 'active' : ''}`}
            onClick={() => setFilter(type.id)}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Items table */}
      <table className="cs-data-table">
        <thead>
          <tr>
            <th className="cs-col-active">Active</th>
            <th className="cs-col-name">Name</th>
            <th className="cs-col-weight">Weight</th>
            <th className="cs-col-qty">Qty</th>
            <th className="cs-col-notes">Notes</th>
          </tr>
        </thead>
        <tbody>
          {filteredItems.length === 0 ? (
            <tr className="cs-table-empty-row">
              <td colSpan={5}>No items</td>
            </tr>
          ) : (
            filteredItems.map((item) => (
              <tr
                key={item.id}
                className={`cs-table-row ${item.equipped ? 'equipped' : ''}`}
                onClick={() => setEditingItem(item)}
              >
                <td className="cs-cell-active">
                  <span
                    className="cs-active-toggle"
                    onClick={(e) => toggleEquipped(item.id, e)}
                    title={item.equipped ? 'Unequip' : 'Equip'}
                  >
                    {item.equipped ? '●' : '○'}
                  </span>
                </td>
                <td className="cs-cell-name">
                  {item.name}
                  {item.attuned && <span className="cs-attuned-badge">A</span>}
                </td>
                <td className="cs-cell-weight">{item.weight ? `${item.weight}` : '—'}</td>
                <td className="cs-cell-qty">{item.quantity != null ? item.quantity : '—'}</td>
                <td className="cs-cell-notes">{item.description || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Add button - full width */}
      <button className="cs-table-add-btn" onClick={addItem}>
        + Add Item
      </button>

      {/* Footer with total weight */}
      <div className="cs-table-footer">
        <div className="cs-total-weight">
          Total: {totalWeight.toFixed(1)} lb
        </div>
      </div>

      {editingItem && (
        <InventoryItemModal
          item={editingItem}
          onUpdate={(updates) => updateItem(editingItem.id, updates)}
          onDelete={() => deleteItem(editingItem.id)}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
