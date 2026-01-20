// D&D 2024 - Action Modal Component

import { NumberInput } from '../../../../../shared';
import { ABILITY_NAMES, ABILITY_ORDER, DAMAGE_TYPES } from '../../constants';
import type { CharacterAction, AbilityName } from 'shared';
import '../modals/Modals.scss';

interface ActionModalProps {
  action: CharacterAction;
  onUpdate: (updates: Partial<CharacterAction>) => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ActionModal({ action, onUpdate, onDelete, onClose }: ActionModalProps) {
  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{action.name || 'New Action'}</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={action.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Action name"
            />
          </div>

          {/* Attack settings */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Ability</label>
              <select
                value={action.ability || ''}
                onChange={(e) => onUpdate({ ability: (e.target.value as AbilityName) || undefined })}
              >
                <option value="">—</option>
                {ABILITY_ORDER.map((ab) => (
                  <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Extra Bonus</label>
              <NumberInput
                value={action.extraBonus || 0}
                onChange={(value) => onUpdate({ extraBonus: value })}
                defaultValue={0}
              />
            </div>
          </div>

          {/* Proficiency checkbox */}
          <div className="cs-form-group cs-checkbox-group">
            <label className="cs-checkbox-label">
              <input
                type="checkbox"
                checked={action.proficient || false}
                onChange={(e) => onUpdate({ proficient: e.target.checked })}
              />
              <span>Proficient</span>
            </label>
          </div>

          {/* Damage settings */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Damage</label>
              <input
                type="text"
                value={action.damage ?? ''}
                onChange={(e) => onUpdate({ damage: e.target.value })}
                placeholder="1d8"
              />
            </div>
            <div className="cs-form-group">
              <label>Damage Bonus</label>
              <NumberInput
                value={action.damageBonus || 0}
                onChange={(value) => onUpdate({ damageBonus: value })}
                defaultValue={0}
              />
            </div>
          </div>

          <div className="cs-form-group">
            <label>Damage Type</label>
            <select
              value={action.damageType ?? ''}
              onChange={(e) => onUpdate({ damageType: e.target.value || undefined })}
            >
              <option value="">—</option>
              {DAMAGE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div className="cs-form-group">
            <label>Notes</label>
            <textarea
              value={action.notes ?? ''}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Action
          </button>
        </div>
      </div>
    </div>
  );
}
