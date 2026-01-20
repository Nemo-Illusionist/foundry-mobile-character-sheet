// MobileTabBar Component - Bottom tab bar for mobile navigation
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './MobileTabBar.scss';

interface MobileTabBarProps {
  variant: 'game';
}

export function MobileTabBar({ variant }: MobileTabBarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { gameId } = useParams<{ gameId: string }>();

  if (variant !== 'game' || !gameId) return null;

  const currentPath = location.pathname;
  const isCharactersActive = currentPath === `/games/${gameId}/characters`;
  const isItemsActive = currentPath === `/games/${gameId}/items`;

  return (
    <nav className="mobile-tab-bar">
      <button
        className={`mobile-tab-bar-item ${isCharactersActive ? 'active' : ''}`}
        onClick={() => navigate(`/games/${gameId}/characters`)}
      >
        <span className="mobile-tab-bar-icon">⚔️</span>
        <span className="mobile-tab-bar-label">Characters</span>
      </button>
      <button
        className={`mobile-tab-bar-item ${isItemsActive ? 'active' : ''}`}
        onClick={() => navigate(`/games/${gameId}/items`)}
      >
        <span className="mobile-tab-bar-icon">📦</span>
        <span className="mobile-tab-bar-label">Items</span>
      </button>
    </nav>
  );
}
