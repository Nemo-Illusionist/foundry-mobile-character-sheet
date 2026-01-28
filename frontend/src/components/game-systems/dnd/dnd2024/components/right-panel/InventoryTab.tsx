// D&D 2024 - Inventory Tab Component

import { useInventory } from '../../hooks';
import { InventoryItemModal } from './InventoryItemModal';
import type { Character } from 'shared';

interface InventoryTabProps {
  character: Character;
  gameId: string;
}

export function InventoryTab({ character, gameId }: InventoryTabProps) {
  const {
    editingItem,
    setEditingItem,
    filter,
    setFilter,
    filteredItems,
    totalWeight,
    addItem,
    updateItem,
    deleteItem,
    toggleEquipped,
    updateCurrency,
    ITEM_TYPES,
  } = useInventory(character, gameId);

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
