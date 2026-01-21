// Characters Page - List all characters in a game
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth, usePublicCharacters, useGameMenuItems, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import { CharacterPublicInfoModal } from '../components/characters/CharacterPublicInfoModal';
import {
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageSection,
  PageGrid,
  DropdownMenu,
} from '../components/shared';
import type { PublicCharacter } from 'shared';

export default function GamePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { firebaseUser } = useAuth();
  const { currentGame } = useGame();
  const { characters, loading: charactersLoading, isGM } = usePublicCharacters();
  const createModal = useModalState();
  const publicInfoModal = useModalState();
  const [selectedCharacter, setSelectedCharacter] = useState<PublicCharacter | null>(null);

  const menuItems = useGameMenuItems({ isGM, onCreateCharacter: createModal.open });

  // Handle ?action=create URL param
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      createModal.open();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, createModal]);

  const canAccessFullSheet = (character: PublicCharacter) => {
    if (!firebaseUser) return false;
    // Owner or GM can access full sheet
    return character.ownerId === firebaseUser.uid || isGM;
  };

  const handleCharacterClick = (character: PublicCharacter) => {
    if (canAccessFullSheet(character)) {
      // Navigate to full character sheet
      navigate(`/games/${gameId}/characters/${character.id}`);
    } else {
      // Show public info modal
      setSelectedCharacter(character);
      publicInfoModal.open();
    }
  };

  const handleCharacterCreated = (characterId: string) => {
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  const handlePublicInfoModalClose = () => {
    publicInfoModal.close();
    setSelectedCharacter(null);
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
        actions={
          <div className="mobile-menu">
            <DropdownMenu items={menuItems} />
          </div>
        }
      />

      {characters.length === 0 ? (
        <PageEmpty
          icon="🎭"
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
                    onClick={() => handleCharacterClick(character)}
                    showHiddenBadge={isGM}
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
                    onClick={() => handleCharacterClick(character)}
                    showHiddenBadge={isGM}
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
          gameSystem={currentGame?.system}
          isGM={isGM}
        />
      )}

      <CharacterPublicInfoModal
        isOpen={publicInfoModal.isOpen}
        onClose={handlePublicInfoModalClose}
        character={selectedCharacter}
      />
    </PageLayout>
  );
}
