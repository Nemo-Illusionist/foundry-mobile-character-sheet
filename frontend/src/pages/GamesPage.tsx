// Games Page - List all user's games
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useGames, useModalState } from '../hooks';
import { isGameMaster } from '../services/games.service';
import { signOut } from '../services/auth.service';
import { GameCard } from '../components/games/GameCard';
import { CreateGameModal } from '../components/games/CreateGameModal';
import { UserSettingsModal } from '../components/user';
import { AuthenticatedLayout } from '../layouts/AuthenticatedLayout';
import {
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageGrid,
  DropdownMenu,
  Input,
  Select,
} from '../components/shared';
import { GAME_SYSTEM_NAMES, DEFAULT_GAME_SYSTEM, type GameSystem } from 'shared';
import './GamesPage.scss';

export default function GamesPage() {
  const navigate = useNavigate();
  const { firebaseUser, user } = useAuth();
  const { games, loading } = useGames();
  const createModal = useModalState();
  const settingsModal = useModalState();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [systemFilter, setSystemFilter] = useState<GameSystem | ''>('');
  const [gmOnlyFilter, setGmOnlyFilter] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // System options for select
  const systemOptions = useMemo(() => [
    { value: '', label: 'All Systems' },
    ...Object.entries(GAME_SYSTEM_NAMES).map(([value, label]) => ({ value, label })),
  ], []);

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      // Search by name
      const matchesSearch = !searchQuery || game.name.toLowerCase().includes(searchQuery.toLowerCase());
      // Filter by system (treat undefined as default system)
      const matchesSystem = !systemFilter || (game.system || DEFAULT_GAME_SYSTEM) === systemFilter;
      // Filter by GM status
      const matchesGM = !gmOnlyFilter || !firebaseUser || isGameMaster(game, firebaseUser.uid);

      return matchesSearch && matchesSystem && matchesGM;
    });
  }, [games, searchQuery, systemFilter, gmOnlyFilter, firebaseUser]);

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleGameCreated = (gameId: string) => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout
        variant="games"
        onCreateGame={createModal.open}
        onOpenSettings={settingsModal.open}
        onLogout={handleLogout}
      >
        <PageLayout>
          <PageLoading message="Loading games..." />
        </PageLayout>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      variant="games"
      onCreateGame={createModal.open}
      onOpenSettings={settingsModal.open}
      onLogout={handleLogout}
    >
      <PageLayout>
        <PageHeader
          title="My Games"
          subtitle={
            <p>
              Welcome, <strong>{user?.displayName || firebaseUser?.displayName || 'Player'}</strong>
            </p>
          }
          actions={
            <div className="mobile-menu">
              <DropdownMenu
                items={[
                  { label: 'Create Game', icon: '+', onClick: createModal.open },
                  { label: 'Profile', icon: '👤', onClick: settingsModal.open },
                  { label: 'Logout', icon: '🚪', onClick: handleLogout },
                ]}
              />
            </div>
          }
        />

        {/* Search and Filters */}
        <div className="games-filters">
          <button
            className="games-filters-toggle"
            onClick={() => setFiltersExpanded(!filtersExpanded)}
          >
            🔍 {filtersExpanded ? 'Hide Filters' : 'Search & Filter'}
          </button>
          <div className={`games-filters-content ${filtersExpanded ? 'expanded' : ''}`}>
            <Input
              className="games-search"
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="games-filters-row">
              <Select
                className="games-filter-select"
                options={systemOptions}
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value as GameSystem | '')}
              />
              <label className="games-filter-checkbox">
                <input
                  type="checkbox"
                  checked={gmOnlyFilter}
                  onChange={(e) => setGmOnlyFilter(e.target.checked)}
                />
                <span>GM</span>
              </label>
            </div>
          </div>
        </div>

        {games.length === 0 ? (
          <PageEmpty
            icon="🎲"
            title="No Games Yet"
            description="Create your first game to start your TTRPG adventure!"
            action={{
              label: '+ Create Your First Game',
              onClick: createModal.open,
            }}
          />
        ) : filteredGames.length === 0 ? (
          <PageEmpty
            icon="🔍"
            title="No Games Found"
            description="Try adjusting your search or filters."
          />
        ) : (
          <PageGrid>
            {filteredGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                isGM={firebaseUser ? isGameMaster(game, firebaseUser.uid) : false}
                onClick={() => handleGameClick(game.id)}
              />
            ))}
          </PageGrid>
        )}

        <CreateGameModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSuccess={handleGameCreated}
        />

        <UserSettingsModal
          isOpen={settingsModal.isOpen}
          onClose={settingsModal.close}
        />
      </PageLayout>
    </AuthenticatedLayout>
  );
}
