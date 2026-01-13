// useCharacters Hook - Real-time subscription to game characters
import { useEffect, useState } from 'react';
import { subscribeToGameCharacters } from '../services/characters.service';
import { useAuth } from '../context/AuthContext';
import { useGame } from '../context/GameContext';
import type { Character } from 'shared';

export function useCharacters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentGame } = useGame();

  useEffect(() => {
    if (!currentGame || !user) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    console.log('Subscribing to characters for game:', currentGame.id);
    setLoading(true);
    setError(null);

    const isGM = currentGame.gmId === user.uid;

    const unsubscribe = subscribeToGameCharacters(
      currentGame.id,
      user.uid,
      isGM,
      (updatedCharacters) => {
        console.log('Characters updated:', updatedCharacters);
        setCharacters(updatedCharacters);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [currentGame, user]);

  return { characters, loading, error };
}
