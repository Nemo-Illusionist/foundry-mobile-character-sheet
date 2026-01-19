// Game Layout - Loads game data into context for all game pages with real-time updates
import { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useAuth } from '../hooks';
import { subscribeToGame, isGameMaster } from '../services/games.service';
import { LoadingSpinner } from '../components/shared';
import { AuthenticatedLayout } from './AuthenticatedLayout';

export default function GameLayout() {
  const { gameId } = useParams<{ gameId: string }>();
  const { currentGame, setCurrentGame } = useGame();
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  // Only show loading if we don't have a game in context yet
  const [loading, setLoading] = useState(!currentGame || currentGame.id !== gameId);

  const isGM = currentGame && firebaseUser ? isGameMaster(currentGame, firebaseUser.uid) : false;

  useEffect(() => {
    if (!gameId) {
      setLoading(false);
      return;
    }

    // If we already have this game in context, don't show loading
    if (currentGame?.id === gameId) {
      setLoading(false);
    } else {
      setLoading(true);
    }

    // Subscribe to game changes in real-time
    const unsubscribe = subscribeToGame(gameId, (game) => {
      if (game) {
        setCurrentGame(game);
        setLoading(false);
      } else {
        console.error('GameLayout: game not found');
        navigate('/games');
      }
    });

    // Cleanup: unsubscribe and clear game context when leaving game pages
    return () => {
      unsubscribe();
      setCurrentGame(null);
    };
  }, [gameId, setCurrentGame, navigate]);

  if (loading) {
    return (
      <AuthenticatedLayout variant="game" isGM={isGM}>
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
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout variant="game" isGM={isGM}>
      <Outlet />
    </AuthenticatedLayout>
  );
}
