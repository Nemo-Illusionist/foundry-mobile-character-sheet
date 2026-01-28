// D&D 2024 - Right Panel Component (Desktop/Wide Tablet)

import { useState, useEffect } from 'react';
import { useCharacterStats } from '../../hooks';
import { ConditionsModal } from '../modals';
import { ActionsTab } from './ActionsTab';
import { SpellsTab } from './SpellsTab';
import { InventoryTab } from './InventoryTab';
import { BiographyTab } from './BiographyTab';
import { ClassTab } from './ClassTab';
import type { Character } from 'shared';
import './RightPanel.scss';

interface RightPanelProps {
  character: Character;
  gameId: string;
  externalTab?: 'actions' | 'spells' | 'inventory' | 'bio' | 'class' | null;
  hideTabHeader?: boolean;
}

type TabId = 'actions' | 'spells' | 'inventory' | 'bio' | 'class';

export function RightPanel({ character, gameId, externalTab, hideTabHeader }: RightPanelProps) {
  const [conditionsOpen, setConditionsOpen] = useState(false);
  const [internalTab, setInternalTab] = useState<TabId>('actions');

  // Use external tab if provided, otherwise use internal state
  const activeTab = externalTab ?? internalTab;
  const setActiveTab = (tab: TabId) => {
    if (!externalTab) {
      setInternalTab(tab);
    }
  };

  const {
    displayedInitiative,
    activeConditions,
    handleInspirationToggle,
    handleExhaustionChange,
  } = useCharacterStats(character, gameId);

  const allTabs: { id: TabId; label: string }[] = [
    { id: 'actions', label: 'Actions' },
    { id: 'spells', label: 'Spells' },
    { id: 'inventory', label: 'Items' },
    { id: 'bio', label: 'Bio' },
    { id: 'class', label: 'Class' },
  ];

  // Filter tabs based on settings
  const tabs = allTabs.filter((tab) =>
    !(tab.id === 'spells' && character.hideSpellsTab)
  );

  // Switch to first available tab if current is hidden (only when using internal tabs)
  useEffect(() => {
    if (!externalTab && !tabs.find((t) => t.id === activeTab) && tabs.length > 0) {
      setInternalTab(tabs[0].id);
    }
  }, [tabs, activeTab, externalTab]);

  return (
    <div className="cs-right-panel">
      {/* Stats row: Inspiration, Initiative, Exhaustion, Conditions */}
      {/* Hidden in mobile/tablet mode (when hideTabHeader is true) - stats shown in CharacterSheet */}
      {!hideTabHeader && (
      <div className="cs-right-stats-row">
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

        {/* Conditions - expandable on desktop, number on wide tablet */}
        <div
          className="cs-mini-stat cs-conditions-stat"
          style={{ cursor: 'pointer' }}
          onClick={() => setConditionsOpen(true)}
        >
          <div className="cs-mini-label">Conditions</div>
          {/* Compact view (dash or number) */}
          <div className="cs-mini-value cs-conditions-compact">
            {activeConditions.length > 0 ? activeConditions.length : '—'}
          </div>
          {/* Expanded view (max 2 conditions + ellipsis) */}
          <div className="cs-conditions-expanded">
            {activeConditions.length === 0
              ? '—'
              : activeConditions.length <= 2
                ? activeConditions.join(', ')
                : `${activeConditions.slice(0, 2).join(', ')}...`}
          </div>
        </div>
      </div>
      )}

      {/* Tabbed content area */}
      <div className={`cs-tab-container ${hideTabHeader ? 'cs-no-tab-header' : ''}`}>
        {!hideTabHeader && (
          <div className="cs-tab-header">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`cs-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
        <div className="cs-tab-content">
          {activeTab === 'actions' && (
            <ActionsTab character={character} gameId={gameId} />
          )}
          {activeTab === 'spells' && (
            <SpellsTab character={character} gameId={gameId} />
          )}
          {activeTab === 'inventory' && (
            <InventoryTab character={character} gameId={gameId} />
          )}
          {activeTab === 'bio' && (
            <BiographyTab character={character} gameId={gameId} />
          )}
          {activeTab === 'class' && (
            <ClassTab character={character} gameId={gameId} />
          )}
        </div>
      </div>

      {/* Conditions Modal */}
      {conditionsOpen && (
        <ConditionsModal
          character={character}
          gameId={gameId}
          onClose={() => setConditionsOpen(false)}
        />
      )}
    </div>
  );
}
