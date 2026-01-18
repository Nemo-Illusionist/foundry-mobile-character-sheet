// D&D 2024 - Spell Modal Component

import type { CharacterSpellEntry, MagicSchool } from 'shared';
import '../modals/Modals.css';

interface SpellModalProps {
  spell: CharacterSpellEntry;
  onUpdate: (updates: Partial<CharacterSpellEntry>) => void;
  onDelete: () => void;
  onClose: () => void;
}

const SPELL_LEVELS = [
  { value: 0, label: 'Cantrip' },
  { value: 1, label: '1st Level' },
  { value: 2, label: '2nd Level' },
  { value: 3, label: '3rd Level' },
  { value: 4, label: '4th Level' },
  { value: 5, label: '5th Level' },
  { value: 6, label: '6th Level' },
  { value: 7, label: '7th Level' },
  { value: 8, label: '8th Level' },
  { value: 9, label: '9th Level' },
];

const MAGIC_SCHOOLS: { value: MagicSchool; label: string }[] = [
  { value: 'Abjuration', label: 'Abjuration' },
  { value: 'Conjuration', label: 'Conjuration' },
  { value: 'Divination', label: 'Divination' },
  { value: 'Enchantment', label: 'Enchantment' },
  { value: 'Evocation', label: 'Evocation' },
  { value: 'Illusion', label: 'Illusion' },
  { value: 'Necromancy', label: 'Necromancy' },
  { value: 'Transmutation', label: 'Transmutation' },
];

const CASTING_TIMES = [
  '1 action',
  '1 bonus action',
  '1 reaction',
  '1 minute',
  '10 minutes',
  '1 hour',
  '8 hours',
  '12 hours',
  '24 hours',
];

export function SpellModal({ spell, onUpdate, onDelete, onClose }: SpellModalProps) {
  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>{spell.name || 'New Spell'}</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Name */}
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={spell.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Spell name"
            />
          </div>

          {/* Level and School */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Level</label>
              <select
                value={spell.level}
                onChange={(e) => onUpdate({ level: parseInt(e.target.value) })}
              >
                {SPELL_LEVELS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>School</label>
              <select
                value={spell.school || ''}
                onChange={(e) => onUpdate({ school: (e.target.value as MagicSchool) || undefined })}
              >
                <option value="">—</option>
                {MAGIC_SCHOOLS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Casting Time and Range */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Casting Time</label>
              <select
                value={spell.castingTime || ''}
                onChange={(e) => onUpdate({ castingTime: e.target.value || undefined })}
              >
                <option value="">—</option>
                {CASTING_TIMES.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div className="cs-form-group">
              <label>Range</label>
              <input
                type="text"
                value={spell.range || ''}
                onChange={(e) => onUpdate({ range: e.target.value || undefined })}
                placeholder="Self, Touch, 30 feet..."
              />
            </div>
          </div>

          {/* Components and Duration */}
          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Components</label>
              <input
                type="text"
                value={spell.components || ''}
                onChange={(e) => onUpdate({ components: e.target.value || undefined })}
                placeholder="V, S, M (a feather)"
              />
            </div>
            <div className="cs-form-group">
              <label>Duration</label>
              <input
                type="text"
                value={spell.duration || ''}
                onChange={(e) => onUpdate({ duration: e.target.value || undefined })}
                placeholder="Instantaneous, 1 minute..."
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="cs-form-row">
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={spell.concentration || false}
                  onChange={(e) => onUpdate({ concentration: e.target.checked })}
                />
                <span>Concentration</span>
              </label>
            </div>
            <div className="cs-form-group cs-checkbox-group">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={spell.ritual || false}
                  onChange={(e) => onUpdate({ ritual: e.target.checked })}
                />
                <span>Ritual</span>
              </label>
            </div>
            {spell.level > 0 && (
              <div className="cs-form-group cs-checkbox-group">
                <label className="cs-checkbox-label">
                  <input
                    type="checkbox"
                    checked={spell.prepared || false}
                    onChange={(e) => onUpdate({ prepared: e.target.checked })}
                  />
                  <span>Prepared</span>
                </label>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="cs-form-group">
            <label>Description</label>
            <textarea
              value={spell.description || ''}
              onChange={(e) => onUpdate({ description: e.target.value || undefined })}
              placeholder="Spell description..."
              rows={4}
            />
          </div>

          {/* Source */}
          <div className="cs-form-group">
            <label>Source</label>
            <input
              type="text"
              value={spell.source || ''}
              onChange={(e) => onUpdate({ source: e.target.value || undefined })}
              placeholder="PHB 279, XGE 152..."
            />
          </div>

          {/* Delete button */}
          <button className="cs-btn cs-btn-danger cs-btn-full" onClick={onDelete}>
            Delete Spell
          </button>
        </div>
      </div>
    </div>
  );
}
