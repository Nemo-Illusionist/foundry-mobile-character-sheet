// Character Card Component
import { Card } from '../shared';
import type { Character } from 'shared';
import './CharacterCard.css';

interface CharacterCardProps {
  character: Character;
  onClick: () => void;
}

export function CharacterCard({ character, onClick }: CharacterCardProps) {
  return (
    <Card onClick={onClick} className="character-card">
      <div className="character-card-header">
        <div className="character-info">
          <h3 className="character-name">{character.name}</h3>
          <p className="character-details">
            Level {character.level} {character.race} {character.class}
          </p>
        </div>
        {character.type === 'Minion' && (
          <span className="character-badge">Minion</span>
        )}
      </div>

      <div className="character-stats">
        <div className="stat-item">
          <span className="stat-label">HP</span>
          <span className="stat-value hp-value">
            {character.hp.current}/{character.hp.max}
          </span>
        </div>
        <div className="stat-item">
          <span className="stat-label">AC</span>
          <span className="stat-value">{character.ac}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Speed</span>
          <span className="stat-value">{character.speed} ft</span>
        </div>
      </div>
    </Card>
  );
}
