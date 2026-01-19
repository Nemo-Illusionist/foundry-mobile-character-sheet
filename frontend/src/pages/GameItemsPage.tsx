// Game Items Page - Shared game items (maps, notes, images)
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth, useGameItems, useModalState } from '../hooks';
import { useGame } from '../context/GameContext';
import { isGameMaster } from '../services/games.service';
import { filterGameItemsByVisibility, deleteGameItem } from '../services/gameItems.service';
import { GameItemCard } from '../components/gameItems/GameItemCard';
import { GameItemDetailModal } from '../components/gameItems/GameItemDetailModal';
import { CreateGameItemModal } from '../components/gameItems/CreateGameItemModal';
import {
  Button,
  PageLayout,
  PageHeader,
  PageLoading,
  PageEmpty,
  PageGrid,
  DropdownMenu,
} from '../components/shared';
import type { GameItem } from 'shared';

export default function GameItemsPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { currentGame: game } = useGame();
  const { items, loading: itemsLoading } = useGameItems(gameId || null);
  const createModal = useModalState();
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);

  if (itemsLoading || !firebaseUser) {
    return (
      <PageLayout>
        <PageLoading message="Loading items..." />
      </PageLayout>
    );
  }

  if (!game) {
    return null; // GameLayout handles loading
  }

  const isGM = isGameMaster(game, firebaseUser.uid);
  const visibleItems = filterGameItemsByVisibility(items, isGM);

  const handleDeleteItem = async (itemId: string) => {
    if (!gameId) return;
    await deleteGameItem(gameId, itemId);
  };

  return (
    <PageLayout>
      <PageHeader
        title="Game Items"
        subtitle={<p>{game.name}</p>}
        actions={
          <>
            <div className="mobile-menu">
              <DropdownMenu
                items={[
                  { label: 'Add Item', icon: '+', onClick: createModal.open },
                  { label: 'Back to Games', icon: '←', onClick: () => navigate('/games') },
                  ...(isGM ? [{ label: 'Game Settings', icon: '⚙️', onClick: () => navigate(`/games/${gameId}/manage`) }] : []),
                ]}
              />
            </div>
            <Button className="hide-on-mobile" onClick={createModal.open}>+ Add Item</Button>
          </>
        }
      />

      {visibleItems.length === 0 ? (
        <PageEmpty
          icon="📦"
          title="No Items Yet"
          description="Add maps, notes, and images to share with your party!"
          action={{
            label: '+ Add Your First Item',
            onClick: createModal.open,
          }}
        />
      ) : (
        <PageGrid minWidth="280px">
          {visibleItems.map((item) => (
            <GameItemCard
              key={item.id}
              item={item}
              onClick={() => setSelectedItem(item)}
              isGM={isGM}
            />
          ))}
        </PageGrid>
      )}

      <GameItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onDelete={handleDeleteItem}
        isGM={isGM}
      />

      {gameId && (
        <CreateGameItemModal
          isOpen={createModal.isOpen}
          onClose={createModal.close}
          onSuccess={() => console.log('Item created successfully')}
          gameId={gameId}
          userId={firebaseUser.uid}
          isGM={isGM}
        />
      )}
    </PageLayout>
  );
}
