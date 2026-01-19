// Game Management Page - Manage players, settings
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { isGameMaster } from '../services/games.service';
import { PlayersList } from '../components/games/PlayersList';
import { InvitePlayerModal } from '../components/game-manage/InvitePlayerModal';
import { GameSettingsSection } from '../components/game-manage/GameSettingsSection';
import { TransferGMSection } from '../components/game-manage/TransferGMSection';
import { PageLayout, PageHeader } from '../components/shared';
import './GameManagePage.css';

export default function GameManagePage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { currentGame: game } = useGame();
  const inviteModal = useModalState();

  if (!game || !firebaseUser) {
    return null; // GameLayout handles loading
  }

  const isGM = isGameMaster(game, firebaseUser.uid);

  return (
    <PageLayout>
      <PageHeader
        title="Game Management"
        subtitle={<p>{game.name}</p>}
        backButton={{
          label: 'Back to Characters',
          onClick: () => navigate(`/games/${gameId}`),
        }}
      />

      <div className="manage-sections">
        {isGM && <GameSettingsSection game={game} />}

        <PlayersList
          playerIds={game.playerIds}
          gmId={game.gmId}
          gameId={game.id}
          currentUserId={firebaseUser.uid}
          isGM={isGM}
          onInviteClick={inviteModal.open}
        />

        {isGM && (
          <TransferGMSection game={game} currentUserId={firebaseUser.uid} />
        )}
      </div>

      <InvitePlayerModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.close}
        onSuccess={() => console.log('Player invited successfully')}
        gameId={game.id}
      />
    </PageLayout>
  );
}
