// D&D 2024 - Settings Modal Component

import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character } from 'shared';
import './Modals.css';

interface SettingsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function SettingsModal({ character, gameId, onClose }: SettingsModalProps) {
  const update = (changes: Partial<Character>) => {
    updateCharacter(gameId, character.id, changes);
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Character Settings</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-form-group">
            <label>Name</label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => update({ name: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Background</label>
            <input
              type="text"
              value={character.race}
              onChange={(e) => update({ race: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Class</label>
            <input
              type="text"
              value={character.class}
              onChange={(e) => update({ class: e.target.value })}
            />
          </div>

          <div className="cs-form-group">
            <label>Subclass</label>
            <input
              type="text"
              value={character.subclass || ''}
              onChange={(e) => update({ subclass: e.target.value })}
            />
          </div>

          <div className="cs-form-row">
            <div className="cs-form-group">
              <label>Armor Class</label>
              <NumberInput
                value={character.ac}
                onChange={(value) => update({ ac: value })}
                min={0}
                defaultValue={10}
              />
            </div>

            <div className="cs-form-group">
              <label>Speed</label>
              <NumberInput
                value={character.speed}
                onChange={(value) => update({ speed: value })}
                min={0}
                defaultValue={30}
              />
            </div>
          </div>

          <div className="cs-form-group cs-checkbox-group">
            <label className="cs-checkbox-label">
              <input
                type="checkbox"
                checked={character.hideSpellsTab || false}
                onChange={(e) => update({ hideSpellsTab: e.target.checked })}
              />
              <span>Hide Spells Tab</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
