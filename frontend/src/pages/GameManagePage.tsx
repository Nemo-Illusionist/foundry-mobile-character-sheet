// Game Management Page - GM only
import { useEffect } from 'react';
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

  const isGM = game && firebaseUser ? isGameMaster(game, firebaseUser.uid) : false;

  // Redirect non-GMs to characters page
  useEffect(() => {
    if (game && firebaseUser && !isGM) {
      navigate(`/games/${gameId}/characters`, { replace: true });
    }
  }, [game, firebaseUser, isGM, gameId, navigate]);

  if (!game || !firebaseUser || !isGM) {
    return null;
  }

  return (
    <PageLayout>
      <PageHeader
        title="Game Management"
        subtitle={<p>{game.name}</p>}
      />

      <div className="manage-sections">
        <GameSettingsSection game={game} />

        <PlayersList
          playerIds={game.playerIds}
          gmId={game.gmId}
          gameId={game.id}
          currentUserId={firebaseUser.uid}
          isGM={true}
          onInviteClick={inviteModal.open}
        />

        <TransferGMSection game={game} currentUserId={firebaseUser.uid} />
      </div>

      <InvitePlayerModal
        isOpen={inviteModal.isOpen}
        onClose={inviteModal.close}
        onSuccess={() => {}}
        gameId={game.id}
      />
    </PageLayout>
  );
}
