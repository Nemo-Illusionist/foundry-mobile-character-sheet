// Characters Page - List all characters in a game (Refactored)
import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth, useCharacters, useGameMenuItems, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { isGameMaster } from '../services/games.service';
import { getUsers } from '../services/users.service';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import {
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageSection,
  PageGrid,
  DropdownMenu,
} from '../components/shared';
import type { User } from 'shared';

export default function GamePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { firebaseUser } = useAuth();
  const { currentGame } = useGame();
  const { characters, loading: charactersLoading } = useCharacters();
  const createModal = useModalState();
  const [playerUsers, setPlayerUsers] = useState<Map<string, User>>(new Map());

  const isGM = currentGame && firebaseUser ? isGameMaster(currentGame, firebaseUser.uid) : false;
  const menuItems = useGameMenuItems({ isGM, onCreateCharacter: createModal.open });

  // Handle ?action=create URL param
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      createModal.open();
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, createModal]);

  // Load player names for GM view
  useEffect(() => {
    if (!isGM || !currentGame) return;

    const playerIds = currentGame.playerIds.filter(id => id !== currentGame.gmId);
    if (playerIds.length === 0) return;

    getUsers(playerIds).then(users => {
      const usersMap = new Map<string, User>();
      users.forEach(user => usersMap.set(user.uid, user));
      setPlayerUsers(usersMap);
    });
  }, [isGM, currentGame]);

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

  // For GM: group characters by player (excluding GM's own)
  const getPlayerGroups = () => {
    if (!currentGame) return [];

    const gmId = currentGame.gmId;
    const playerCharacters = characters.filter(c => c.ownerId !== gmId);

    // Group by ownerId
    const groups = new Map<string, typeof characters>();
    playerCharacters.forEach(char => {
      const existing = groups.get(char.ownerId) || [];
      groups.set(char.ownerId, [...existing, char]);
    });

    // Convert to array with player names
    return Array.from(groups.entries()).map(([ownerId, chars]) => ({
      ownerId,
      playerName: playerUsers.get(ownerId)?.displayName || 'Player',
      characters: chars,
    }));
  };

  const gmCharacters = currentGame ? characters.filter(c => c.ownerId === currentGame.gmId) : [];
  const playerGroups = isGM ? getPlayerGroups() : [];

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
      ) : isGM ? (
        // GM View: GM characters first, then player characters grouped by owner
        <>
          {gmCharacters.length > 0 && (
            <PageSection title="My Characters" count={gmCharacters.length}>
              <PageGrid>
                {gmCharacters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                  />
                ))}
              </PageGrid>
            </PageSection>
          )}

          {playerGroups.map((group) => (
            <PageSection key={group.ownerId} title={group.playerName} count={group.characters.length}>
              <PageGrid>
                {group.characters.map((character) => (
                  <CharacterCard
                    key={character.id}
                    character={character}
                    onClick={() => handleCharacterClick(character.id)}
                  />
                ))}
              </PageGrid>
            </PageSection>
          ))}
        </>
      ) : (
        // Player View: My characters, then other characters
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
          gameSystem={currentGame?.system}
        />
      )}
    </PageLayout>
  );
}
