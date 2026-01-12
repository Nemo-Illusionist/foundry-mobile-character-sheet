// Create Character Modal Component
import { FormEvent, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { createCharacter } from '../../services/characters.service';
import './CreateCharacterModal.css';

interface CreateCharacterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (characterId: string) => void;
  gameId: string;
  userId: string;
}

export function CreateCharacterModal({
  isOpen,
  onClose,
  onSuccess,
  gameId,
  userId,
}: CreateCharacterModalProps) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Character name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const characterId = await createCharacter(gameId, userId, name.trim());

      // Reset form
      setName('');

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
