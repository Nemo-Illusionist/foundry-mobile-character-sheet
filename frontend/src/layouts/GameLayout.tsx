// Game Layout - Loads game data into context for all game pages
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { getGame } from '../services/games.service';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';

export default function GameLayout() {
  const { gameId } = useParams<{ gameId: string }>();
  const { setCurrentGame } = useGame();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    getGame(gameId)
      .then((game) => {
        if (game) {
          setCurrentGame(game);
          setLoading(false);
        } else {
          console.error('Game not found');
          navigate('/games');
        }
      })
      .catch((error) => {
        console.error('Error loading game:', error);
        navigate('/games');
      });

    // Cleanup: clear game context when leaving game pages
    return () => {
      setCurrentGame(null);
    };
  }, [gameId, setCurrentGame, navigate]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: '1rem'
      }}>
        <LoadingSpinner size="large" />
        <p>Loading game...</p>
      </div>
    );
  }

  return <Outlet />;
}
