// Games Page - List all user's games
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGames } from '../hooks/useGames';
import { isGameMaster } from '../services/games.service';
import { signOut } from '../services/auth.service';
import { GameCard } from '../components/games/GameCard';
import { CreateGameModal } from '../components/games/CreateGameModal';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import './GamesPage.css';

export default function GamesPage() {
  const navigate = useNavigate();
  const { firebaseUser, user } = useAuth();
  const { games, loading } = useGames();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleGameCreated = (gameId: string) => {
    console.log('Game created:', gameId);
    navigate(`/games/${gameId}/characters`);
  };

  if (loading) {
    return (
      <div className="games-page">
        <div className="games-loading">
          <LoadingSpinner size="large" />
          <p>Loading games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="games-page">
      <div className="games-container">
        <div className="games-header">
          <div className="games-header-content">
            <h1 className="games-title">My Games</h1>
            <p className="games-subtitle">
              Welcome, <strong>{user?.displayName || firebaseUser?.displayName || 'Player'}</strong>
            </p>
          </div>
          <div className="games-actions">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Create Game
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>

        {games.length === 0 ? (
          <div className="games-empty">
            <div className="empty-icon">🎲</div>
            <h2>No Games Yet</h2>
            <p>Create your first game to start your D&D adventure!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Create Your First Game
            </Button>
          </div>
        ) : (
          <>
            <div className="games-section">
              <h2 className="section-title">
                Personal Game
                <span className="section-count">
                  {games.filter((g) => g.isPersonal).length}
                </span>
              </h2>
              <div className="games-grid">
                {games
                  .filter((game) => game.isPersonal)
                  .map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      isGM={firebaseUser ? isGameMaster(game, firebaseUser.uid) : false}
                      onClick={() => handleGameClick(game.id)}
                    />
                  ))}
              </div>
            </div>

            {games.filter((g) => !g.isPersonal).length > 0 && (
              <div className="games-section">
                <h2 className="section-title">
                  Campaigns
                  <span className="section-count">
                    {games.filter((g) => !g.isPersonal).length}
                  </span>
                </h2>
                <div className="games-grid">
                  {games
                    .filter((game) => !game.isPersonal)
                    .map((game) => (
                      <GameCard
                        key={game.id}
                        game={game}
                        isGM={firebaseUser ? isGameMaster(game, firebaseUser.uid) : false}
                        onClick={() => handleGameClick(game.id)}
                      />
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreateGameModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleGameCreated}
      />
    </div>
  );
}
