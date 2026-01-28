// D&D 2024 Character Sheet - Main Component

import { CharacterHeader } from './components/header';
import { AbilitiesSection } from './components/abilities';
import { RightPanel } from './components/right-panel';
import { ConditionsModal } from './components/modals';
import { useCharacterStats, useCharacterSheetLayout } from './hooks';
import type { Character } from 'shared';

interface CharacterSheetProps {
  character: Character;
  gameId: string;
}

export function CharacterSheet({ character, gameId }: CharacterSheetProps) {
  const {
    headerExpanded,
    mobileTab,
    setMobileTab,
    isMobileMode,
    isTabletMode,
    isTrueMobile,
    conditionsOpen,
    setConditionsOpen,
    moreMenuOpen,
    setMoreMenuOpen,
    moreMenuRef,
    visibleMainTabs,
    moreTabs,
    isMoreTabActive,
    handleToggleExpand,
    getRightPanelTab,
  } = useCharacterSheetLayout(character);

  const {
    displayedInitiative,
    activeConditions,
    handleInspirationToggle,
    handleExhaustionChange,
  } = useCharacterStats(character, gameId);

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
            {/* Main tabs */}
            {visibleMainTabs.map((tab) => (
              <button
                key={tab.id}
                className={`cs-mobile-tab-btn ${mobileTab === tab.id ? 'active' : ''}`}
                onClick={() => setMobileTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}

            {/* On true mobile (< 650px): show "..." menu */}
            {isTrueMobile ? (
              <div className="cs-more-menu-wrapper" ref={moreMenuRef}>
                <button
                  className={`cs-mobile-tab-btn ${isMoreTabActive ? 'active' : ''}`}
                  onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                >
                  •••
                </button>
                {moreMenuOpen && (
                  <div className="cs-more-menu">
                    {moreTabs.map((tab) => (
                      <button
                        key={tab.id}
                        className={`cs-more-menu-item ${mobileTab === tab.id ? 'active' : ''}`}
                        onClick={() => {
                          setMobileTab(tab.id);
                          setMoreMenuOpen(false);
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* On tablet (>= 650px): show all tabs */
              moreTabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`cs-mobile-tab-btn ${mobileTab === tab.id ? 'active' : ''}`}
                  onClick={() => setMobileTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))
            )}
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
