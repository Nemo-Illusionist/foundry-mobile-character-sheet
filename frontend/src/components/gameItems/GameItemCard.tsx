// Game Item Card Component
import { Card } from '../shared/Card';
import type { GameItem } from 'shared';
import './GameItemCard.css';

interface GameItemCardProps {
  item: GameItem;
  onClick: () => void;
  isGM: boolean;
}

export function GameItemCard({ item, onClick, isGM }: GameItemCardProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Map':
        return '🗺️';
      case 'Note':
        return '📝';
      case 'Image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  return (
    <Card onClick={onClick} className="game-item-card">
      <div className="game-item-header">
        <div className="game-item-icon">{getTypeIcon(item.type)}</div>
        <div className="game-item-info">
          <h3 className="game-item-name">{item.name}</h3>
          <p className="game-item-type">{item.type}</p>
        </div>
        <div className="game-item-badges">
          {item.visibleTo === 'gm' && isGM && (
            <span className="visibility-badge gm-only">GM Only</span>
          )}
        </div>
      </div>

      {item.description && (
        <p className="game-item-description">{item.description}</p>
      )}

      {item.imageUrl && (
        <div className="game-item-preview">
          <img src={item.imageUrl} alt={item.name} />
        </div>
      )}
    </Card>
  );
}
