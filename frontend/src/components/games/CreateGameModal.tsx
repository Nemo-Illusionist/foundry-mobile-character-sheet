// Create Game Modal Component
import { FormEvent, useState } from 'react';
import { Modal, Input, Button } from '../shared';
import { createGame } from '../../services/games.service';
import { useAuth } from '../../hooks';
import './CreateGameModal.css';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (gameId: string) => void;
}

export function CreateGameModal({ isOpen, onClose, onSuccess }: CreateGameModalProps) {
  const { firebaseUser } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!firebaseUser) {
      setError('You must be logged in to create a game');
      return;
    }

    if (name.trim().length < 3) {
      setError('Game name must be at least 3 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const gameId = await createGame(name.trim(), description.trim() || undefined, firebaseUser.uid);

      // Reset form
      setName('');
      setDescription('');

      onSuccess(gameId);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setDescription('');
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Game">
      <form onSubmit={handleSubmit} className="create-game-form">
        {error && <div className="form-error">{error}</div>}

        <Input
          type="text"
          label="Game Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Epic Campaign"
          required
          autoFocus
        />

        <div className="input-wrapper">
          <label className="input-label">Description (Optional)</label>
          <textarea
            className="game-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your game..."
            rows={4}
          />
        </div>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Game'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
