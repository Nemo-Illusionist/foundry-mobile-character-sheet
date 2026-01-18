// Characters Page - List all characters in a game (Refactored)
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useCharacters, useModalState } from '../hooks';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import {
  Button,
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageSection,
  PageGrid,
} from '../components/shared';

export default function GamePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { characters, loading: charactersLoading } = useCharacters();
  const createModal = useModalState();

  const handleCharacterClick = (characterId: string) => {
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  const handleCharacterCreated = (characterId: string) => {
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  if (charactersLoading || !firebaseUser) {
    return (
      <PageLayout>
        <PageLoading message="Loading characters..." />
      </PageLayout>
    );
  }

  const myCharacters = characters.filter((c) => c.ownerId === firebaseUser.uid);
  const otherCharacters = characters.filter((c) => c.ownerId !== firebaseUser.uid);

  return (
    <PageLayout>
      <PageHeader
        title="Characters"
        backButton={{
          label: 'Back to Games',
          onClick: () => navigate('/games'),
        }}
        actions={
          <>
            <Button onClick={createModal.open}>+ Create Character</Button>
            <Button variant="secondary" onClick={() => navigate(`/games/${gameId}/items`)}>
              📦 Game Items
            </Button>
            <Button variant="secondary" onClick={() => navigate(`/games/${gameId}/manage`)}>
              ⚙️
            </Button>
          </>
        }
      />

      {characters.length === 0 ? (
        <PageEmpty
          icon="⚔️"
          title="No Characters Yet"
          description="Create your first character to begin your adventure!"
          action={{
            label: '+ Create Your First Character',
            onClick: createModal.open,
          }}
        />
      ) : (
        <>
          {myCharacters.length > 0 && (
            <PageSection title="My Characters" count={myCharacters.length}>
              <PageGrid>
                {myCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}

          {otherCharacters.length > 0 && (
            <PageSection title="Other Characters" count={otherCharacters.length}>
              <PageGrid>
                {otherCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}
        </>
      )}

      {firebaseUser && gameId && (
        <CreateCharacterModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSuccess={handleCharacterCreated}
          gameId={gameId}
          userId={firebaseUser.uid}
        />
      )}
    </PageLayout>
  );
}
