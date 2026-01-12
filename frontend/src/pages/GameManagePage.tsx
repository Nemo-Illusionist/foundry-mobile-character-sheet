// Game Management Page - Manage players, settings
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGameById } from '../hooks/useGameById';
import { isGameMaster } from '../services/games.service';
import { PlayersList } from '../components/games/PlayersList';
import { InvitePlayerModal } from '../components/game-manage/InvitePlayerModal';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import './GameManagePage.css';

export default function GameManagePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { game, loading } = useGameById(gameId || null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleBack = () => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleInviteSuccess = () => {
    console.log('Player invited successfully - game will update via subscription');
    // No need to manually reload - subscription will update automatically
  };

  if (loading) {
    return (
      <div className="game-manage-page">
        <div className="game-manage-loading">
          <LoadingSpinner size="large" />
          <p>Loading game...</p>
        </div>
      </div>
    );
  }

  if (!game || !firebaseUser) {
    return (
      <div className="game-manage-page">
        <div className="game-manage-error">
          <h2>Game Not Found</h2>
          <Button onClick={() => navigate('/games')}>Back to Games</Button>
        </div>
      </div>
    );
  }

  const isGM = isGameMaster(game, firebaseUser.uid);

  return (
    <div className="game-manage-page">
      <div className="game-manage-container">
        {/* Header */}
        <div className="game-manage-header">
          <Button variant="secondary" onClick={handleBack}>
            ← Back to Characters
          </Button>
          <div className="game-title-section">
            <h1 className="game-manage-title">Game Management</h1>
            <p className="game-manage-subtitle">{game.name}</p>
          </div>
        </div>

        {/* Content */}
        <div className="game-manage-content">
          <PlayersList
            playerIds={game.playerIds}
            gmId={game.gmId}
            gameId={game.id}
            currentUserId={firebaseUser.uid}
            isGM={isGM}
            onInviteClick={() => setIsInviteModalOpen(true)}
          />
        </div>
      </div>

      <InvitePlayerModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={handleInviteSuccess}
        gameId={game.id}
      />
    </div>
  );
}
