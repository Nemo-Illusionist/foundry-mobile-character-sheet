// Players Section Component - For Game Management page
import { useState, useEffect } from 'react';
import { getUsers } from '../../services/users.service';
import { removePlayerFromGame } from '../../services/games.service';
import { Button, ConfirmDialog, AlertDialog } from '../shared';
import type { User } from 'shared';

interface PlayersSectionProps {
  playerIds: string[];
  gmId: string;
  gameId: string;
  currentUserId: string;
  onInviteClick: () => void;
}

export function PlayersSection({ playerIds, gmId, gameId, currentUserId, onInviteClick }: PlayersSectionProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerToRemove, setPlayerToRemove] = useState<User | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPlayers();
  }, [playerIds]);

  const loadPlayers = async () => {
    setLoading(true);
    const loadedPlayers = await getUsers(playerIds);
    setPlayers(loadedPlayers);
    setLoading(false);
  };

  const handleRemovePlayer = async () => {
    if (!playerToRemove) return;

    setIsRemoving(true);
    try {
      await removePlayerFromGame(gameId, playerToRemove.uid);
      setPlayerToRemove(null);
    } catch (error) {
      setErrorMessage('Failed to remove player: ' + (error as Error).message);
      setPlayerToRemove(null);
    } finally {
      setIsRemoving(false);
    }
  };

  // Sort players: GM first, then alphabetically
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.uid === gmId) return -1;
    if (b.uid === gmId) return 1;
    return a.displayName.localeCompare(b.displayName);
  });

  return (
    <section className="manage-section">
      <div className="manage-section-header">
        <h3 className="manage-section-title">
          <span className="manage-section-icon">👥</span>
          Players ({players.length})
        </h3>
        <Button onClick={onInviteClick} variant="secondary">
          Invite Player
        </Button>
      </div>

      {loading ? (
        <p className="players-empty">Loading players...</p>
      ) : players.length === 0 ? (
        <p className="players-empty">No players yet. Invite someone to join!</p>
      ) : (
        <div className="players-grid">
          {sortedPlayers.map((player) => (
            <div key={player.uid} className="player-card">
              <div className="player-avatar">
                {player.photoURL ? (
                  <img src={player.photoURL} alt={player.displayName} />
                ) : (
                  <span>{player.displayName.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="player-info">
                <span className="player-name">{player.displayName}</span>
                {player.uid === gmId && <span className="player-role">Game Master</span>}
              </div>
              {player.uid !== gmId && player.uid !== currentUserId && (
                <button
                  className="player-remove"
                  onClick={() => setPlayerToRemove(player)}
                  title="Remove player"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={!!playerToRemove}
        onClose={() => setPlayerToRemove(null)}
        onConfirm={handleRemovePlayer}
        title="Remove Player"
        message={`Are you sure you want to remove ${playerToRemove?.displayName} from the game? Their characters will remain but they won't be able to access them.`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={isRemoving}
      />

      <AlertDialog
        isOpen={!!errorMessage}
        onClose={() => setErrorMessage(null)}
        title="Error"
        message={errorMessage || ''}
      />
    </section>
  );
}
