// Character Sheet Layout - Generic wrapper for all game systems
// Provides loading, error states and base structure

import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner } from '../shared';
import './CharacterSheetLayout.css';

interface CharacterSheetLayoutProps {
  children: ReactNode;
  loading?: boolean;
  error?: boolean;
  gameId?: string;
}

export function CharacterSheetLayout({
  children,
  loading = false,
  error = false,
  gameId,
}: CharacterSheetLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (gameId) {
      navigate(`/games/${gameId}/characters`);
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-loading">
          <LoadingSpinner size="large" />
          <p>Loading character...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="character-sheet-page">
        <div className="character-sheet-error">
          <h2>Character Not Found</h2>
          <Button onClick={handleBack}>Back to Characters</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="character-sheet-page">
      {children}
    </div>
  );
}
