// Invite Player Modal Component
import { FormEvent, useState } from 'react';
import { Modal } from '../shared/Modal';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { getUserByEmail } from '../../services/users.service';
import { addPlayerToGame } from '../../services/games.service';
import './InvitePlayerModal.css';

interface InvitePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameId: string;
}

export function InvitePlayerModal({
  isOpen,
  onClose,
  onSuccess,
  gameId,
}: InvitePlayerModalProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const input = email.trim();
    if (!input) {
      setError('Please enter an email address');
      return;
    }

    if (!input.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Email lookup
      const user = await getUserByEmail(input.toLowerCase());

      if (!user) {
        setError('User with this email not found. They need to register first.');
        setLoading(false);
        return;
      }

      // Add player to game
      await addPlayerToGame(gameId, user.uid);

      setSuccess(`${user.displayName} added to game!`);
      setEmail('');

      // Close modal after short delay
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccess('');
      }, 1500);
    } catch (err) {
      const error = err as Error;
      if (error.message === 'Player already in game') {
        setError('This player is already in the game');
      } else {
        setError(error.message || 'Failed to invite player');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setEmail('');
      setError('');
      setSuccess('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Invite Player">
      <form onSubmit={handleSubmit} className="invite-player-form">
        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        <Input
          type="email"
          label="Player Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="player@example.com"
          required
          autoFocus
          disabled={loading}
        />

        <p className="invite-hint">
          Enter the email address of a registered user to invite them to your game.
        </p>

        <div className="modal-actions">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Inviting...' : 'Invite Player'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
