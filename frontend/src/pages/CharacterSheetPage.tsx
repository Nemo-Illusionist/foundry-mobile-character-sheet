// Character Sheet Page - Thin wrapper using CharacterSheetLayout

import { useParams } from 'react-router-dom';
import { useCharacter } from '../hooks';
import { CharacterSheetLayout } from '../components/character-sheet';
import { DnD2024CharacterSheet } from '../components/game-systems';

export default function CharacterSheetPage() {
  const { gameId, characterId } = useParams<{ gameId: string; characterId: string }>();
  const { character, loading } = useCharacter(gameId || null, characterId || null);

  return (
    <CharacterSheetLayout
      loading={loading}
      error={!loading && !character}
      gameId={gameId}
    >
      {character && <DnD2024CharacterSheet character={character} gameId={gameId!} />}
    </CharacterSheetLayout>
  );
}
