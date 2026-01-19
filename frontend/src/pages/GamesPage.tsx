// Games Page - List all user's games (Refactored)
import { useNavigate } from 'react-router-dom';
import { useAuth, useGames, useModalState } from '../hooks';
import { isGameMaster } from '../services/games.service';
import { signOut } from '../services/auth.service';
import { GameCard } from '../components/games/GameCard';
import { CreateGameModal } from '../components/games/CreateGameModal';
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

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleGameClick = (gameId: string) => {
    navigate(`/games/${gameId}`);
  };

  const handleGameCreated = (gameId: string) => {
    navigate(`/games/${gameId}`);
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
            <Button variant="secondary" onClick={handleLogout}>Logout</Button>
          </>
        }
      />

      {games.length === 0 ? (
        <PageEmpty
          icon="🎲"
          title="No Games Yet"
          description="Create your first game to start your D&D adventure!"
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
    </PageLayout>
  );
}
