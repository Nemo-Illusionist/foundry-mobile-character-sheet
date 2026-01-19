// Game Settings Section Component
import { FormEvent, useState, useEffect } from 'react';
import { Input, Button } from '../shared';
import { updateGame } from '../../services/games.service';
import type { Game } from 'shared';
import './GameSettingsSection.css';

interface GameSettingsSectionProps {
  game: Game;
}

export function GameSettingsSection({ game }: GameSettingsSectionProps) {
  const [name, setName] = useState(game.name);
  const [description, setDescription] = useState(game.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setName(game.name);
    setDescription(game.description || '');
  }, [game]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (trimmedName.length < 3) {
      setError('Game name must be at least 3 characters');
      return;
    }

    const hasChanges = trimmedName !== game.name || description.trim() !== (game.description || '');
    if (!hasChanges) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateGame(game.id, {
        name: trimmedName,
        description: description.trim(),
      });
      setSuccess('Settings saved');
    } catch (err) {
      setError((err as Error).message || 'Failed to update game');
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = name.trim() !== game.name || description.trim() !== (game.description || '');

  return (
    <section className="game-settings-section">
      <h3 className="section-title">Game Settings</h3>

      <form onSubmit={handleSubmit} className="settings-form">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <Input
          type="text"
          label="Game Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Game name"
          disabled={loading}
        />

        <div className="input-wrapper">
          <label className="input-label">Description</label>
          <textarea
            className="game-description-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your game..."
            rows={4}
            disabled={loading}
          />
        </div>

        <Button type="submit" disabled={loading || !hasChanges}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </section>
  );
}
