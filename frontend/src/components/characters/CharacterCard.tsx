// Character Card Component - Shows public character info
import { Card } from '../shared';
import {
  GAME_SUBSYSTEM_NAMES,
  ENTITY_TYPE_NAMES,
  DEFAULT_SHEET_TYPE,
  parseSheetType,
  type PublicCharacter,
} from 'shared';
import { getAvatarUrl } from '../game-systems/dnd/dnd2024/utils/avatar';
import './CharacterCard.scss';

interface CharacterCardProps {
  character: PublicCharacter;
  onClick: () => void;
  showHiddenBadge?: boolean;
  ownerName?: string;
}

export function CharacterCard({
  character,
  onClick,
  showHiddenBadge,
  ownerName,
}: CharacterCardProps) {
  // Use new fields if available, fallback to legacy sheetType parsing
  const entityType = character.entityType ?? parseSheetType(character.sheetType || DEFAULT_SHEET_TYPE).entityType;
  const subsystem = character.subsystem ?? parseSheetType(character.sheetType || DEFAULT_SHEET_TYPE).subsystem;
  const sheetTypeName = entityType === 'mob'
    ? `${ENTITY_TYPE_NAMES[entityType]} ${GAME_SUBSYSTEM_NAMES[subsystem]}`
    : GAME_SUBSYSTEM_NAMES[subsystem];

  return (
    <Card onClick={onClick} className="character-card">
      <div className="character-card-header">
        <div className="character-avatar">
          <img src={getAvatarUrl(character.avatar)} alt={character.name} />
        </div>
        <div className="character-info">
          <h3 className="character-name">{character.name}</h3>
          {ownerName && (
            <p className="character-owner">Player: {ownerName}</p>
          )}
          {character.publicDescription && (
            <p className="character-description">{character.publicDescription}</p>
          )}
        </div>
        <div className="character-card-badges">
          <span className="character-badge sheet-type">{sheetTypeName}</span>
          {showHiddenBadge && character.isHidden && (
            <span className="character-badge hidden-badge">Hidden</span>
          )}
        </div>
      </div>
    </Card>
  );
}
