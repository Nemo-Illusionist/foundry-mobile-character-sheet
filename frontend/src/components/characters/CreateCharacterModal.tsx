// Create Character Modal Component
import { FormEvent, useState } from 'react';
import { Modal, Input, Button } from '../shared';
import { createCharacter } from '../../services/characters.service';
import { SHEET_TYPE_NAMES, SYSTEM_SHEET_TYPES, type SheetType, type GameSystem } from 'shared';
import './CreateCharacterModal.scss';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (characterId: string) => void;
  gameId: string;
  userId: string;
  gameSystem?: GameSystem;
  isGM?: boolean;
}

export function CreateCharacterModal({
  isOpen,
  onClose,
  onSuccess,
  gameId,
  userId,
  gameSystem = 'dnd',
  isGM = false,
}: CreateCharacterModalProps) {
  const [name, setName] = useState('');
  const [sheetType, setSheetType] = useState<SheetType>('character-2024');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Get available sheet types for this game system
  const availableSheetTypes = SYSTEM_SHEET_TYPES[gameSystem] || SYSTEM_SHEET_TYPES.dnd;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Character name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // GM's characters are hidden by default
      const characterId = await createCharacter(gameId, userId, name.trim(), sheetType, isGM);

      // Reset form
      setName('');
      setSheetType('character-2024');

      onSuccess(characterId);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create character');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setSheetType('character-2024');
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Character">
      <form onSubmit={handleSubmit} className="create-character-form">
        {error && <div className="form-error">{error}</div>}

        <Input
          type="text"
          label="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter character name"
          required
          autoFocus
        />

        <div className="input-wrapper">
          <label className="input-label">Sheet Type</label>
          <select
            className="sheet-type-select"
            value={sheetType}
            onChange={(e) => setSheetType(e.target.value as SheetType)}
          >
            {availableSheetTypes.map((type) => (
              <option key={type} value={type}>
                {SHEET_TYPE_NAMES[type]}
              </option>
            ))}
          </select>
        </div>

        <p className="create-character-hint">
          You can customize race, class, abilities, and other details after creating the character.
        </p>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Character'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
