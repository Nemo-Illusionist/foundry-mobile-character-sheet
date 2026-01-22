// D&D 2024 Character Sheet - Main Component

import { useState, useEffect, useRef } from 'react';
import { CharacterHeader } from './components/header';
import { AbilitiesSection } from './components/abilities';
import { RightPanel } from './components/right-panel';
import { ConditionsModal } from './components/modals';
import { updateCharacter } from '../../../../services/characters.service';
import { getAbilityModifier } from '../core';
import type { Character } from 'shared';

interface CharacterSheetProps {
  character: Character;
  gameId: string;
}

// Threshold in pixels to trigger collapse
const SCROLL_THRESHOLD = 50;

// Breakpoints
const MOBILE_BREAKPOINT = 650;
const WIDE_TABLET_BREAKPOINT = 850;

// Tab IDs for unified mobile navigation
type MobileTabId = 'abilities' | 'actions' | 'spells' | 'inventory' | 'bio';

export function CharacterSheet({ character, gameId }: CharacterSheetProps) {
  const [headerExpanded, setHeaderExpanded] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTabId>('abilities');
  const [isMobileMode, setIsMobileMode] = useState(false);
  const [isTabletMode, setIsTabletMode] = useState(false); // 650-849px
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const lastScrollY = useRef(0);
  const isManualToggle = useRef(false);

  // Track window width for mobile/tablet mode
  useEffect(() => {
    const checkWidth = () => {
      const width = window.innerWidth;
      setIsMobileMode(width < WIDE_TABLET_BREAKPOINT);
      setIsTabletMode(width >= MOBILE_BREAKPOINT && width < WIDE_TABLET_BREAKPOINT);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  // Stats row handlers
  const initiativeModifier = getAbilityModifier(character.abilities.dex);
  const displayedInitiative = character.initiativeOverride ?? initiativeModifier;
  const activeConditions = character.conditions || [];

  const handleInspirationToggle = async () => {
    await updateCharacter(gameId, character.id, {
      inspiration: !character.inspiration,
    });
  };

  const handleExhaustionChange = async (level: number) => {
    await updateCharacter(gameId, character.id, {
      exhaustion: level,
    });
  };

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

  // Build available mobile tabs
  const allMobileTabs: { id: MobileTabId; label: string }[] = [
    { id: 'abilities', label: 'Stats' },
    { id: 'actions', label: 'Actions' },
    { id: 'spells', label: 'Spells' },
    { id: 'inventory', label: 'Items' },
    { id: 'bio', label: 'Bio' },
  ];

  // Filter out spells tab if hidden
  const mobileTabs = allMobileTabs.filter(
    (tab) => !(tab.id === 'spells' && character.hideSpellsTab)
  );

  // Ensure active tab is valid
  useEffect(() => {
    if (!mobileTabs.find((t) => t.id === mobileTab) && mobileTabs.length > 0) {
      setMobileTab(mobileTabs[0].id);
    }
  }, [mobileTabs, mobileTab]);

  // Map mobile tab to RightPanel tab
  const getRightPanelTab = (): 'actions' | 'spells' | 'inventory' | 'bio' | null => {
    if (mobileTab === 'abilities') return null;
    return mobileTab;
  };

  return (
    <>
      <CharacterHeader
        character={character}
        gameId={gameId}
        expanded={headerExpanded}
        onToggleExpand={handleToggleExpand}
      />

      {/* Main content */}
      <div className="character-sheet-content">
        {/* Tablet stats row (650-849px only) - not on mobile, they're in header */}
        {isTabletMode && (
          <div className="cs-tablet-stats-row">
            <div
              className="cs-mini-stat"
              style={{ cursor: 'pointer' }}
              onClick={handleInspirationToggle}
            >
              <div className="cs-mini-label">Inspiration</div>
              <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
            </div>

            <div className="cs-mini-stat">
              <div className="cs-mini-label">Initiative</div>
              <div className="cs-mini-value">
                {displayedInitiative >= 0 ? '+' : ''}{displayedInitiative}
              </div>
            </div>

            <div className="cs-mini-stat">
              <div className="cs-mini-label">Exhaustion</div>
              <select
                className="cs-mini-value cs-exhaustion-select"
                value={character.exhaustion || 0}
                onChange={(e) => handleExhaustionChange(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div
              className="cs-mini-stat"
              style={{ cursor: 'pointer' }}
              onClick={() => setConditionsOpen(true)}
            >
              <div className="cs-mini-label">Conditions</div>
              <div className="cs-mini-value">
                {activeConditions.length > 0 ? activeConditions.length : '—'}
              </div>
            </div>
          </div>
        )}

        {/* Mobile/Tablet unified tab bar (< 850px) */}
        {isMobileMode && (
          <div className="cs-mobile-tab-bar">
            {mobileTabs.map((tab) => (
              <button
                key={tab.id}
                className={`cs-mobile-tab-btn ${mobileTab === tab.id ? 'active' : ''}`}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <div className="cs-main-layout">
          {/* Left panel: Abilities - show on desktop always, on mobile only when abilities tab is active */}
          <div className={`cs-main-left ${isMobileMode && mobileTab !== 'abilities' ? 'cs-hidden' : ''}`}>
            <AbilitiesSection
              character={character}
              gameId={gameId}
              hideSectionHeader={isMobileMode}
            />
          </div>

          {/* Right panel: Actions/Spells/Inventory/Bio */}
          {/* On desktop (>= 850px): always visible with internal tabs */}
          {/* On mobile/tablet (< 850px): visible when non-abilities tab selected, no internal tabs */}
          <div className={`cs-main-right ${isMobileMode ? (mobileTab === 'abilities' ? 'cs-hidden' : 'cs-mobile-right-panel') : 'cs-desktop-only'}`}>
            <RightPanel
              character={character}
              gameId={gameId}
              externalTab={isMobileMode ? getRightPanelTab() : undefined}
              hideTabHeader={isMobileMode}
            />
          </div>
        </div>
      </div>

      {/* Conditions Modal for tablet stats row */}
      {conditionsOpen && (
        <ConditionsModal
          character={character}
          gameId={gameId}
          onClose={() => setConditionsOpen(false)}
        />
      )}
    </>
  );
}
