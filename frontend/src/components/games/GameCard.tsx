// Game Card Component
import { Card } from '../shared';
import type { Game } from 'shared';
import './GameCard.css';

interface GameCardProps {
  game: Game;
  isGM: boolean;
  onClick: () => void;
}

export function GameCard({ game, isGM, onClick }: GameCardProps) {
  return (
    <Card onClick={onClick} className="game-card">
      <div className="game-card-header">
        <h3 className="game-card-title">{game.name}</h3>
        {isGM && <span className="game-badge gm">GM</span>}
      </div>

      {game.description && (
        <p className="game-card-description">{game.description}</p>
      )}

      <div className="game-card-footer">
        <span className="game-card-players">
          👥 {game.playerIds.length} {game.playerIds.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>
    </Card>
  );
}
