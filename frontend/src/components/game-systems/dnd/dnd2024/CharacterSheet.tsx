// D&D 2024 Character Sheet - Main Component

import { useState } from 'react';
import { CharacterHeader } from './components/header';
import { AbilitiesSection } from './components/abilities';
import { RightPanel } from './components/right-panel';
import type { Character } from 'shared';

interface CharacterSheetProps {
  character: Character;
  gameId: string;
}

export function CharacterSheet({ character, gameId }: CharacterSheetProps) {
  const [headerExpanded, setHeaderExpanded] = useState(true);

  return (
    <>
      <CharacterHeader
        character={character}
        gameId={gameId}
        expanded={headerExpanded}
        onToggleExpand={() => setHeaderExpanded(!headerExpanded)}
      />

      {/* Desktop 2-panel layout */}
      <div className="character-sheet-content">
        <div className="cs-main-layout">
          <div className="cs-main-left">
            <AbilitiesSection character={character} gameId={gameId} />
          </div>
          <div className="cs-main-right cs-desktop-only">
            <RightPanel character={character} gameId={gameId} />
          </div>
        </div>
      </div>
    </>
  );
}
