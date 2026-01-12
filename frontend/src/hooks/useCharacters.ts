// useCharacters Hook - Real-time subscription to game characters
import { useEffect, useState } from 'react';
import { subscribeToGameCharacters } from '../services/characters.service';
import type { Character } from 'shared';

export function useCharacters(gameId: string | null) {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    console.log('Subscribing to characters for game:', gameId);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToGameCharacters(gameId, (updatedCharacters) => {
      console.log('Characters updated:', updatedCharacters);
      setCharacters(updatedCharacters);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId]);

  return { characters, loading, error };
}
