// D&D 2024 - Character Header Component (Refactored)

import { useModalState, useCharacterMutation } from '../../../../../../hooks';
import { getAbilityModifier } from '../../../core';
import { getProficiencyBonus } from '../../constants';
import { HPBoxDesktop, HPBoxMobile, HPModal } from '../hp';
import { SettingsModal, LevelXPModal, ConditionsModal, CombatStatsModal } from '../modals';
import type { Character } from 'shared';
import './CharacterHeader.css';

interface CharacterHeaderProps {
  character: Character;
  gameId: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function CharacterHeader({ character, gameId, expanded, onToggleExpand }: CharacterHeaderProps) {
  // Modal states using the new hook
  const settingsModal = useModalState();
  const levelModal = useModalState();
  const hpModal = useModalState();
  const conditionsModal = useModalState();
  const combatStatsModal = useModalState();

  // Character mutation hook
  const { update } = useCharacterMutation(gameId, character);

  const conditionsCount = character.conditions?.length || 0;
  const dexModifier = getAbilityModifier(character.abilities.dex);
  const totalAC = character.ac + (character.shield || 0);
  const displayedInitiative = character.initiativeOverride ?? dexModifier;

  const handleInspirationToggle = async () => {
    await update({ inspiration: !character.inspiration });
  };

  const handleExhaustionChange = async (level: number) => {
    await update({ exhaustion: level });
  };

  return (
    <>
      <div className="cs-header">
        {/* Desktop Layout */}
        <div className="cs-header-desktop">
          <div className="cs-header-left">
            <div className="cs-name-block">
              <h1 className="cs-name">{character.name}</h1>
              <button className="cs-settings-btn" onClick={settingsModal.open}>
                ⚙️
              </button>
            </div>
            <p className="cs-subtitle">{character.race}</p>
            <p className="cs-subtitle">{character.class} {character.subclass && `(${character.subclass})`}</p>
            <button className="cs-level-btn" onClick={levelModal.open}>
              Level {character.level}
            </button>
          </div>

          <div className="cs-header-right">
            <div className="cs-combat-stats-desktop">
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value cs-bordered">{totalAC}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
              <div className="cs-stat-item cs-stat-proficiency">
                <div className="cs-stat-value">+{getProficiencyBonus(character.level)}</div>
                <div className="cs-stat-label">Proficiency</div>
              </div>
            </div>
            <HPBoxDesktop character={character} gameId={gameId} onOpenModal={hpModal.open} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="cs-header-mobile">
          {/* Expandable content - always rendered, visibility controlled by CSS */}
          <div className={`cs-mobile-expanded ${expanded ? 'expanded' : 'collapsed'}`}>
            <div className="cs-mobile-expanded-inner">
              <div className="cs-name-block">
                <h1 className="cs-name">{character.name}</h1>
                <button className="cs-settings-btn" onClick={settingsModal.open}>
                  ⚙️
                </button>
              </div>
              <p className="cs-subtitle">
                {character.race} — {character.class} {character.subclass && `(${character.subclass})`}
              </p>

              <button className="cs-level-btn-mobile" onClick={levelModal.open}>
                Level {character.level}
              </button>

              {/* 4 stat blocks */}
              <div className="cs-expanded-stats">
                <div
                  className="cs-mini-stat"
                  style={{ cursor: 'pointer' }}
                  onClick={handleInspirationToggle}
                >
                  <div className="cs-mini-label">Inspiration</div>
                  <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
                </div>
                <div className="cs-mini-stat" style={{ cursor: 'pointer' }} onClick={combatStatsModal.open}>
                  <div className="cs-mini-label">Initiative</div>
                  <div className="cs-mini-value">
                    {displayedInitiative >= 0 ? '+' : ''}{displayedInitiative}
                  </div>
                </div>
                <div
                  className="cs-mini-stat"
                  style={{ cursor: 'pointer' }}
                  onClick={conditionsModal.open}
                >
                  <div className="cs-mini-label">Conditions</div>
                  <div className="cs-mini-value">{conditionsCount > 0 ? conditionsCount : '—'}</div>
                </div>
                <div className="cs-mini-stat">
                  <div className="cs-mini-label">Exhaustion</div>
                  <select
                    className="cs-mini-value cs-exhaustion-select"
                    value={character.exhaustion || 0}
                    onChange={(e) => handleExhaustionChange(Number(e.target.value))}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Always visible stats */}
          <div className="cs-quick-stats-mobile">
            <div className="cs-combat-stats-mobile">
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value cs-bordered">{totalAC}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item cs-clickable" onClick={combatStatsModal.open}>
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
            </div>

            <HPBoxMobile character={character} onClick={hpModal.open} />
          </div>

          {/* Collapse toggle - mobile only */}
          <button className="cs-collapse-btn" onClick={onToggleExpand}>
            {expanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>
      </div>

      {/* Modals */}
      {settingsModal.isOpen && (
        <SettingsModal
          character={character}
          gameId={gameId}
          onClose={settingsModal.close}
        />
      )}

      {levelModal.isOpen && (
        <LevelXPModal
          character={character}
          gameId={gameId}
          onClose={levelModal.close}
        />
      )}

      {hpModal.isOpen && (
        <HPModal
          character={character}
          gameId={gameId}
          onClose={hpModal.close}
        />
      )}

      {conditionsModal.isOpen && (
        <ConditionsModal
          character={character}
          gameId={gameId}
          onClose={conditionsModal.close}
        />
      )}

      {combatStatsModal.isOpen && (
        <CombatStatsModal
          character={character}
          gameId={gameId}
          onClose={combatStatsModal.close}
        />
      )}
    </>
  );
}
