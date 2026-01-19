// Games Page - List all user's games
import { useNavigate } from 'react-router-dom';
import { useAuth, useGames, useModalState } from '../hooks';
import { isGameMaster } from '../services/games.service';
import { GameCard } from '../components/games/GameCard';
import { CreateGameModal } from '../components/games/CreateGameModal';
import { UserSettingsModal } from '../components/user';
import {
  Button,
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageGrid,
} from '../components/shared';

export default function GamesPage() {
  const navigate = useNavigate();
  const { firebaseUser, user } = useAuth();
  const { games, loading } = useGames();
  const createModal = useModalState();
  const settingsModal = useModalState();

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleGameCreated = (gameId: string) => {
    navigate(`/games/${gameId}/characters`);
  };

  if (loading) {
    return (
      <PageLayout>
        <PageLoading message="Loading games..." />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <PageHeader
        title="My Games"
        subtitle={
          <p>
            Welcome, <strong>{user?.displayName || firebaseUser?.displayName || 'Player'}</strong>
          </p>
        }
        actions={
          <>
            <Button onClick={createModal.open}>+ Create Game</Button>
            <Button variant="secondary" onClick={settingsModal.open}>⚙ Settings</Button>
          </>
        }
      />

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
      ) : (
        <PageGrid>
          {games.map((game) => (
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
  );
}
