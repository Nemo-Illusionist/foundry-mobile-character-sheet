// D&D 2024 Character Sheet - Main Component

import { useState, useEffect, useRef } from 'react';
import { CharacterHeader } from './components/header';
import { AbilitiesSection } from './components/abilities';
import { RightPanel } from './components/right-panel';
import type { Character } from 'shared';

interface CharacterSheetProps {
  character: Character;
  gameId: string;
}

// Threshold in pixels to trigger collapse
const SCROLL_THRESHOLD = 50;

export function CharacterSheet({ character, gameId }: CharacterSheetProps) {
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const lastScrollY = useRef(0);
  const isManualToggle = useRef(false);

  // Auto-collapse header on scroll (mobile only)
  useEffect(() => {
    const isMobile = window.innerWidth < 650;
    if (!isMobile) return;

    const handleScroll = () => {
      // Skip if user just manually toggled
      if (isManualToggle.current) {
        isManualToggle.current = false;
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;

      // Expand when at top
      if (currentScrollY <= 10) {
        setHeaderExpanded(true);
      }
      // Collapse when scrolling down past threshold
      else if (currentScrollY > lastScrollY.current && currentScrollY > SCROLL_THRESHOLD) {
        setHeaderExpanded(false);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleExpand = () => {
    isManualToggle.current = true;
    setHeaderExpanded(!headerExpanded);
  };

  return (
    <>
      <CharacterHeader
        character={character}
        gameId={gameId}
        expanded={headerExpanded}
        onToggleExpand={handleToggleExpand}
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
