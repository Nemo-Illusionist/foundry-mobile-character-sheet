// useGameById Hook - Real-time subscription to a single game
import { useEffect, useState } from 'react';
import { subscribeToGame } from '../services/games.service';
import type { Game } from 'shared';

export function useGameById(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setGame(null);
      setLoading(false);
      return;
    }

    console.log('Subscribing to game:', gameId);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGame(gameId, (updatedGame) => {
      console.log('Game updated:', updatedGame);
      setGame(updatedGame);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId]);

  return { game, loading, error };
}
