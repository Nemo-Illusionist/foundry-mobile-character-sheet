// Characters Page - List all characters in a game
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCharacters } from '../hooks/useCharacters';
import { CharacterCard } from '../components/characters/CharacterCard';
import { CreateCharacterModal } from '../components/characters/CreateCharacterModal';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import './CharactersPage.css';

export default function CharactersPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { characters, loading } = useCharacters(gameId || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCharacterClick = (characterId: string) => {
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  const handleCharacterCreated = (characterId: string) => {
    console.log('Character created:', characterId);
    // Navigate to new character sheet
    navigate(`/games/${gameId}/characters/${characterId}`);
  };

  const handleBackToGames = () => {
    navigate('/games');
  };

  if (loading) {
    return (
      <div className="characters-page">
        <div className="characters-loading">
          <LoadingSpinner size="large" />
          <p>Loading characters...</p>
        </div>
      </div>
    );
  }

  const myCharacters = characters.filter((c) => c.ownerId === firebaseUser?.uid);
  const otherCharacters = characters.filter((c) => c.ownerId !== firebaseUser?.uid);

  return (
    <div className="characters-page">
      <div className="characters-container">
        <div className="characters-header">
          <div className="characters-header-content">
            <Button variant="secondary" onClick={handleBackToGames}>
              ← Back to Games
            </Button>
            <h1 className="characters-title">Characters</h1>
          </div>
          <div className="characters-actions">
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Create Character
            </Button>
          </div>
        </div>

        {characters.length === 0 ? (
          <div className="characters-empty">
            <div className="empty-icon">⚔️</div>
            <h2>No Characters Yet</h2>
            <p>Create your first character to begin your adventure!</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              + Create Your First Character
            </Button>
          </div>
        ) : (
          <>
            {myCharacters.length > 0 && (
              <div className="characters-section">
                <h2 className="section-title">
                  My Characters
                  <span className="section-count">{myCharacters.length}</span>
                </h2>
                <div className="characters-grid">
                  {myCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onClick={() => handleCharacterClick(character.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {otherCharacters.length > 0 && (
              <div className="characters-section">
                <h2 className="section-title">
                  Other Characters
                  <span className="section-count">{otherCharacters.length}</span>
                </h2>
                <div className="characters-grid">
                  {otherCharacters.map((character) => (
                    <CharacterCard
                      key={character.id}
                      character={character}
                      onClick={() => handleCharacterClick(character.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {firebaseUser && gameId && (
        <CreateCharacterModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleCharacterCreated}
          gameId={gameId}
          userId={firebaseUser.uid}
        />
      )}
    </div>
  );
}
