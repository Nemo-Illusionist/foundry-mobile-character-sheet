// D&D 2024 - Inventory Item Modal Component

import { NumberInput } from '../../../../../shared';
import type { InventoryItem } from 'shared';
import '../modals/Modals.scss';

interface InventoryItemModalProps {
  item: InventoryItem;
  onUpdate: (updates: Partial<InventoryItem>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const ITEM_TYPE_OPTIONS: { value: InventoryItem['type']; label: string }[] = [
  { value: 'weapon', label: 'Weapon' },
  { value: 'armor', label: 'Armor' },
  { value: 'gear', label: 'Gear' },
  { value: 'consumable', label: 'Consumable' },
  { value: 'treasure', label: 'Treasure' },
  { value: 'other', label: 'Other' },
];

export function InventoryItemModal({ item, onUpdate, onDelete, onClose }: InventoryItemModalProps) {
  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{item.name || 'New Item'}</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Item name"
            />
          </div>

          {/* Type and Quantity */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Type</label>
              <select
                value={item.type}
                onChange={(e) => onUpdate({ type: e.target.value as InventoryItem['type'] })}
              >
                {ITEM_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Quantity</label>
              <NumberInput
                value={item.quantity}
                onChange={(value) => onUpdate({ quantity: Math.max(1, value) })}
                min={1}
                defaultValue={1}
              />
            </div>
          </div>

          {/* Weight */}
          <div className="cs-form-group">
            <label>Weight (lb)</label>
            <NumberInput
              value={item.weight || 0}
              onChange={(value) => onUpdate({ weight: value || undefined })}
              min={0}
              defaultValue={0}
              placeholder="0"
            />
          </div>

          {/* Equipped & Attuned */}
          <div className="cs-form-row">
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={item.equipped || false}
                  onChange={(e) => onUpdate({ equipped: e.target.checked })}
                />
                <span>Equipped</span>
              </label>
            </div>
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={item.attuned || false}
                  onChange={(e) => onUpdate({ attuned: e.target.checked })}
                />
                <span>Attuned</span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div className="cs-form-group">
            <label>Description</label>
            <textarea
              value={item.description ?? ''}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Item description..."
              rows={3}
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Item
          </button>
        </div>
      </div>
    </div>
  );
}
