// Game Items Page - Shared game items (maps, notes, images)
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useGameById } from '../hooks/useGameById';
import { useGameItems } from '../hooks/useGameItems';
import { isGameMaster } from '../services/games.service';
import { filterGameItemsByVisibility, deleteGameItem } from '../services/gameItems.service';
import { GameItemCard } from '../components/gameItems/GameItemCard';
import { CreateGameItemModal } from '../components/gameItems/CreateGameItemModal';
import { Button } from '../components/shared/Button';
import { LoadingSpinner } from '../components/shared/LoadingSpinner';
import './GameItemsPage.css';

export default function GameItemsPage() {
  const navigate = useNavigate();
  const { gameId } = useParams<{ gameId: string }>();
  const { firebaseUser } = useAuth();
  const { game, loading: gameLoading } = useGameById(gameId || null);
  const { items, loading: itemsLoading } = useGameItems(gameId || null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const handleBackToCharacters = () => {
    navigate(`/games/${gameId}/characters`);
  };

  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
  };

  const handleItemCreated = () => {
    console.log('Item created successfully');
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!gameId || !confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await deleteGameItem(gameId, itemId);
      if (selectedItemId === itemId) {
        setSelectedItemId(null);
      }
    } catch (err) {
      console.error('Failed to delete item:', err);
      alert('Failed to delete item');
    }
  };

  if (gameLoading || itemsLoading || !firebaseUser) {
    return (
      <div className="game-items-page">
        <div className="game-items-loading">
          <LoadingSpinner size="large" />
          <p>Loading items...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-items-page">
        <div className="game-items-error">
          <h2>Game Not Found</h2>
          <Button onClick={() => navigate('/games')}>Back to Games</Button>
        </div>
      </div>
    );
  }

  const isGM = isGameMaster(game, firebaseUser.uid);
  const visibleItems = filterGameItemsByVisibility(items, isGM);
  const selectedItem = visibleItems.find((item) => item.id === selectedItemId);

  return (
    <div className="game-items-page">
      <div className="game-items-container">
        <div className="game-items-header">
          <div className="game-items-header-content">
            <Button variant="secondary" onClick={handleBackToCharacters}>
              ← Back to Characters
            </Button>
            <h1 className="game-items-title">Game Items</h1>
            <p className="game-items-subtitle">{game.name}</p>
          </div>
          {isGM && (
            <div className="game-items-actions">
              <Button onClick={() => setIsCreateModalOpen(true)}>
                + Add Item
              </Button>
            </div>
          )}
        </div>

        <div className="game-items-content">
          {visibleItems.length === 0 ? (
            <div className="game-items-empty">
              <div className="empty-icon">📦</div>
              <h2>No Items Yet</h2>
              <p>
                {isGM
                  ? 'Add maps, notes, and images to share with your players!'
                  : 'Your GM hasn\'t added any items yet.'}
              </p>
              {isGM && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  + Add Your First Item
                </Button>
              )}
            </div>
          ) : (
            <div className="game-items-grid">
              {visibleItems.map((item) => (
                <div key={item.id} className="game-item-wrapper">
                  <GameItemCard
                    item={item}
                    onClick={() => handleItemClick(item.id)}
                    isGM={isGM}
                  />
                  {isGM && (
                    <div className="item-actions">
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedItem && (
          <div className="item-detail-overlay" onClick={() => setSelectedItemId(null)}>
            <div className="item-detail-content" onClick={(e) => e.stopPropagation()}>
              <div className="item-detail-header">
                <h2>{selectedItem.name}</h2>
                <button
                  className="close-button"
                  onClick={() => setSelectedItemId(null)}
                >
                  ✕
                </button>
              </div>
              <p className="item-detail-type">{selectedItem.type}</p>
              {selectedItem.description && (
                <p className="item-detail-description">{selectedItem.description}</p>
              )}
              {selectedItem.imageUrl && (
                <div className="item-detail-image">
                  <img src={selectedItem.imageUrl} alt={selectedItem.name} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {firebaseUser && gameId && (
        <CreateGameItemModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleItemCreated}
          gameId={gameId}
          userId={firebaseUser.uid}
          isGM={isGM}
        />
      )}
    </div>
  );
}
