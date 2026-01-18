// Create Game Item Modal Component
import { FormEvent, useState } from 'react';
import { Modal, Input, Button } from '../shared';
import { createGameItem } from '../../services/gameItems.service';
import type { GameItemType } from 'shared';
import './CreateGameItemModal.css';

interface CreateGameItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameId: string;
  userId: string;
  isGM: boolean;
}

export function CreateGameItemModal({
  isOpen,
  onClose,
  onSuccess,
  gameId,
  userId,
  isGM,
}: CreateGameItemModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<GameItemType>('Note');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [visibleTo, setVisibleTo] = useState<'all' | 'gm'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createGameItem(
        gameId,
        name.trim(),
        type,
        description.trim() || undefined,
        imageUrl.trim() || undefined,
        visibleTo,
        userId
      );

      // Reset form
      setName('');
      setType('Note');
      setDescription('');
      setImageUrl('');
      setVisibleTo('all');

      onSuccess();
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName('');
      setType('Note');
      setDescription('');
      setImageUrl('');
      setVisibleTo('all');
      setError('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Game Item">
      <form onSubmit={handleSubmit} className="create-game-item-form">
        {error && <div className="form-error">{error}</div>}

        <Input
          type="text"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name..."
          required
          autoFocus
          disabled={loading}
        />

        <div className="input-wrapper">
          <label className="input-label">Type</label>
          <select
            className="type-select"
            value={type}
            onChange={(e) => setType(e.target.value as GameItemType)}
            disabled={loading}
          >
            <option value="Note">📝 Note</option>
            <option value="Map">🗺️ Map</option>
            <option value="Image">🖼️ Image</option>
          </select>
        </div>

        <div className="input-wrapper">
          <label className="input-label">Description (Optional)</label>
          <textarea
            className="description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            rows={4}
            disabled={loading}
          />
        </div>

        <Input
          type="url"
          label="Image URL (Optional)"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
          disabled={loading}
        />

        {isGM && (
          <div className="input-wrapper">
            <label className="input-label">Visibility</label>
            <select
              className="visibility-select"
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value as 'all' | 'gm')}
              disabled={loading}
            >
              <option value="all">👥 Visible to All Players</option>
              <option value="gm">🔒 GM Only</option>
            </select>
          </div>
        )}

        <div className="modal-actions">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
