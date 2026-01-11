// useGames Hook - Real-time subscription to user's games
import { useEffect, useState } from 'react';
import { subscribeToUserGames } from '../services/games.service';
import { useAuth } from './useAuth';
import type { Game } from 'shared';

export function useGames() {
  const { firebaseUser } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setGames([]);
      setLoading(false);
      return;
    }

    console.log('Subscribing to games for user:', firebaseUser.uid);
    setLoading(true);
    setError(null);

    try {
      const unsubscribe = subscribeToUserGames(firebaseUser.uid, (updatedGames) => {
        console.log('Games updated:', updatedGames);
        setGames(updatedGames);
        setLoading(false);
      });

      return unsubscribe;
    } catch (err) {
      console.error('Error subscribing to games:', err);
      setError('Failed to load games');
      setLoading(false);
    }
  }, [firebaseUser]);

  return { games, loading, error };
}
