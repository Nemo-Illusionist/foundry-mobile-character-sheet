// Transfer GM Section Component
import { useState, useEffect } from 'react';
import { Button, ConfirmDialog } from '../shared';
import { getUsers } from '../../services/users.service';
import { transferGMRole } from '../../services/games.service';
import type { Game, User } from 'shared';
import './TransferGMSection.css';

interface TransferGMSectionProps {
  game: Game;
  currentUserId: string;
}

export function TransferGMSection({ game, currentUserId }: TransferGMSectionProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [transferring, setTransferring] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPlayers();
  }, [game.playerIds]);

  const loadPlayers = async () => {
    setLoading(true);
    const loadedPlayers = await getUsers(game.playerIds);
    // Filter out current GM
    const otherPlayers = loadedPlayers.filter(p => p.uid !== game.gmId);
    setPlayers(otherPlayers);
    setLoading(false);
  };

  const handleTransfer = async () => {
    if (!selectedPlayerId) return;

    setTransferring(true);
    setError('');

    try {
      await transferGMRole(game.id, currentUserId, selectedPlayerId);
      setShowConfirm(false);
      setSelectedPlayerId('');
    } catch (err) {
      setError((err as Error).message || 'Failed to transfer GM role');
    } finally {
      setTransferring(false);
    }
  };

  const selectedPlayer = players.find(p => p.uid === selectedPlayerId);

  if (loading) {
    return (
      <section className="transfer-gm-section">
        <h3 className="section-title">Transfer GM Role</h3>
        <p className="loading-text">Loading players...</p>
      </section>
    );
  }

  if (players.length === 0) {
    return (
      <section className="transfer-gm-section">
        <h3 className="section-title">Transfer GM Role</h3>
        <p className="empty-text">No other players in the game to transfer GM role to.</p>
      </section>
    );
  }

  return (
    <section className="transfer-gm-section">
      <h3 className="section-title">Transfer GM Role</h3>
      <p className="section-description">
        Transfer game master privileges to another player. This action cannot be undone by you.
      </p>

      {error && <div className="form-error">{error}</div>}

      <div className="transfer-form">
        <div className="input-wrapper">
          <label className="input-label">Select New GM</label>
          <select
            className="player-select"
            value={selectedPlayerId}
            onChange={(e) => setSelectedPlayerId(e.target.value)}
            disabled={transferring}
          >
            <option value="">Choose a player...</option>
            {players.map((player) => (
              <option key={player.uid} value={player.uid}>
                {player.displayName}
              </option>
            ))}
          </select>
        </div>

        <Button
          variant="danger"
          onClick={() => setShowConfirm(true)}
          disabled={!selectedPlayerId || transferring}
        >
          Transfer GM Role
        </Button>
      </div>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleTransfer}
        title="Transfer GM Role"
        message={`Are you sure you want to transfer GM role to ${selectedPlayer?.displayName}? You will lose all GM privileges and cannot undo this action.`}
        confirmLabel="Transfer"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={transferring}
      />
    </section>
  );
}
