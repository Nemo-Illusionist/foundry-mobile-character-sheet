// Players List Component
import { useState, useEffect } from 'react';
import { getUsers } from '../../services/users.service';
import { removePlayerFromGame } from '../../services/games.service';
import { Button } from '../shared/Button';
import type { User } from 'shared';
import './PlayersList.css';

interface PlayersListProps {
  playerIds: string[];
  gmId: string;
  gameId: string;
  currentUserId: string;
  isGM: boolean;
  onInviteClick: () => void;
}

export function PlayersList({ playerIds, gmId, gameId, currentUserId, isGM, onInviteClick }: PlayersListProps) {
  const [players, setPlayers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlayers();
  }, [playerIds]);

  const loadPlayers = async () => {
    setLoading(true);
    const loadedPlayers = await getUsers(playerIds);
    setPlayers(loadedPlayers);
    setLoading(false);
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!confirm('Remove this player from the game?')) return;

    try {
      await removePlayerFromGame(gameId, playerId);
    } catch (error) {
      alert('Failed to remove player: ' + (error as Error).message);
    }
  };

  if (loading) {
    return (
      <div className="players-list">
        <h3 className="players-title">Players</h3>
        <p className="players-loading">Loading players...</p>
      </div>
    );
  }

  return (
    <div className="players-list">
      <div className="players-header">
        <h3 className="players-title">Players ({players.length})</h3>
        {isGM && (
          <Button onClick={onInviteClick}>+ Invite Player</Button>
        )}
      </div>
      <div className="players-grid">
        {players.map((player) => (
          <div key={player.uid} className="player-item">
            <div className="player-avatar">
              {player.photoURL ? (
                <img src={player.photoURL} alt={player.displayName} />
              ) : (
                <span>{player.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="player-info">
              <span className="player-name">{player.displayName}</span>
              {player.uid === gmId && <span className="player-role">GM</span>}
            </div>
            {isGM && player.uid !== gmId && player.uid !== currentUserId && (
              <button
                className="player-remove"
                onClick={() => handleRemovePlayer(player.uid)}
                title="Remove player"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
