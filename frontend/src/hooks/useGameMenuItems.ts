// Hook for game page menu items - single source of truth
import { useNavigate, useParams } from 'react-router-dom';

export interface GameMenuItem {
  label: string;
  icon: string;
  onClick: () => void;
}

interface UseGameMenuItemsOptions {
  isGM?: boolean;
  onCreateCharacter?: () => void; // Optional override for pages with local modal
  onAddItem?: () => void; // Optional override for pages with local modal
}

export function useGameMenuItems(options: UseGameMenuItemsOptions = {}): GameMenuItem[] {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { isGM = false, onCreateCharacter, onAddItem } = options;

  if (!gameId) return [];

  const items: GameMenuItem[] = [
    {
      label: 'Create Character',
      icon: '🎭',
      onClick: onCreateCharacter || (() => navigate(`/games/${gameId}/characters?action=create`)),
    },
    {
      label: 'Add Item',
      icon: '📦',
      onClick: onAddItem || (() => navigate(`/games/${gameId}/items?action=create`)),
    },
    {
      label: 'Back to Games',
      icon: '🎲',
      onClick: () => navigate('/games'),
    },
  ];

  if (isGM) {
    items.push({
      label: 'Game Management',
      icon: '⚙️',
      onClick: () => navigate(`/games/${gameId}/manage`),
    });
  }

  return items;
}
