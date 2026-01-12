// useCharacter Hook - Real-time subscription to a single character
import { useEffect, useState } from 'react';
import { subscribeToCharacter } from '../services/characters.service';
import type { Character } from 'shared';

export function useCharacter(gameId: string | null, characterId: string | null) {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!gameId || !characterId) {
      setCharacter(null);
      setLoading(false);
      return;
    }

    console.log('Subscribing to character:', characterId);
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCharacter(gameId, characterId, (updatedCharacter) => {
      console.log('Character updated:', updatedCharacter);
      setCharacter(updatedCharacter);
      setLoading(false);
    });

    return unsubscribe;
  }, [gameId, characterId]);

  return { character, loading, error };
}
