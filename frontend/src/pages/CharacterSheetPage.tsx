// Character Sheet Page - Full D&D 2024 character sheet
import { useNavigate, useParams } from 'react-router-dom';
import { useCharacter } from '../hooks/useCharacter';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import { StatsSection } from '../components/character-sheet/StatsSection';
import './CharacterSheetPage.css';

export default function CharacterSheetPage() {
  const navigate = useNavigate();
  const { gameId, characterId } = useParams<{ gameId: string; characterId: string }>();
  const { character, loading } = useCharacter(gameId || null, characterId || null);

  const handleBack = () => {
    navigate(`/games/${gameId}/characters`);
  };

  if (loading) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-loading">
          <LoadingSpinner size="large" />
          <p>Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-error">
          <h2>Character Not Found</h2>
          <Button onClick={handleBack}>Back to Characters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-sheet-page">
      <div className="character-sheet-container">
        {/* Header */}
        <div className="character-sheet-header">
          <Button variant="secondary" onClick={handleBack}>
            ← Back
          </Button>
          <div className="character-title-section">
            <h1 className="character-sheet-title">{character.name}</h1>
            <p className="character-sheet-subtitle">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="character-sheet-content">
          <StatsSection character={character} gameId={gameId!} />

          {/* More sections will be added here */}
          <div className="section-placeholder">
            <p>Inventory, Spells, and other sections coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
