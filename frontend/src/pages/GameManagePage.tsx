// Game Management Page - Manage players, settings
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks';
import { useGame } from '../context/GameContext';
import { isGameMaster } from '../services/games.service';
import { PlayersList } from '../components/games/PlayersList';
import { InvitePlayerModal } from '../components/game-manage/InvitePlayerModal';
import { Button } from '../components/shared';
import './GameManagePage.css';

export default function GameManagePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { currentGame: game } = useGame();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleBack = () => {
    navigate(`/games/${gameId}`);
  };

  const handleInviteSuccess = () => {
    console.log('Player invited successfully - game will update via subscription');
    // No need to manually reload - subscription will update automatically
  };

  if (!game || !firebaseUser) {
    return null; // GameLayout handles loading
  }

  const isGM = isGameMaster(game, firebaseUser.uid);
  const isPersonalGame = game.isPersonal;

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
            <p className="game-manage-subtitle">
              {game.name}
              {isPersonalGame && <span className="game-badge personal"> Personal</span>}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="game-manage-content">
          {isPersonalGame ? (
            // Personal game - no player management
            <div className="personal-game-info">
              <h2>Personal Game</h2>
              <p>
                This is your personal game. Player management is not available for personal games.
              </p>
              <p>
                You can create and manage characters directly from the characters page.
              </p>
            </div>
          ) : (
            // Multiplayer game - show player management
            <PlayersList
              playerIds={game.playerIds}
              gmId={game.gmId}
              gameId={game.id}
              currentUserId={firebaseUser.uid}
              isGM={isGM}
              onInviteClick={() => setIsInviteModalOpen(true)}
            />
          )}
        </div>
      </div>

      {!isPersonalGame && (
        <InvitePlayerModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={handleInviteSuccess}
          gameId={game.id}
        />
      )}
    </div>
  );
}
