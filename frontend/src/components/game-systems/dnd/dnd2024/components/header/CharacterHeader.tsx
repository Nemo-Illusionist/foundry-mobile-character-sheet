// D&D 2024 - Character Header Component

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core/utils/calculations';
import { getProficiencyBonus } from '../../constants/proficiencyBonus';
import { HPBoxDesktop } from '../hp/HPBoxDesktop';
import { HPBoxMobile } from '../hp/HPBoxMobile';
import { HPModal } from '../hp/HPModal';
import { SettingsModal } from '../modals/SettingsModal';
import { LevelXPModal } from '../modals/LevelXPModal';
import { ConditionsModal } from '../modals/ConditionsModal';
import type { Character } from 'shared';
import './CharacterHeader.css';

interface CharacterHeaderProps {
  character: Character;
  gameId: string;
  expanded: boolean;
  onToggleExpand: () => void;
}

export function CharacterHeader({ character, gameId, expanded, onToggleExpand }: CharacterHeaderProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [levelModalOpen, setLevelModalOpen] = useState(false);
  const [hpModalOpen, setHpModalOpen] = useState(false);
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const conditionsCount = character.conditions?.length || 0;

  const initiativeModifier = getAbilityModifier(character.abilities.dex);

  return (
    <>
      <div className="cs-header">
        {/* Desktop Layout */}
        <div className="cs-header-desktop">
          <div className="cs-header-left">
            <div className="cs-name-block">
              <h1 className="cs-name">{character.name}</h1>
              <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                ⚙️
              </button>
            </div>
            <p className="cs-subtitle">{character.race}</p>
            <p className="cs-subtitle">{character.class} {character.subclass && `(${character.subclass})`}</p>
            <button
              className="cs-level-btn"
              onClick={() => setLevelModalOpen(true)}
            >
              Level {character.level}
            </button>
          </div>

          <div className="cs-header-right">
            <div className="cs-combat-stats-desktop">
              <div className="cs-stat-item">
                <div className="cs-stat-value cs-bordered">{character.ac}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item">
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
              <div className="cs-stat-item">
                <div className="cs-stat-value">+{getProficiencyBonus(character.level)}</div>
                <div className="cs-stat-label">Proficiency</div>
              </div>
            </div>
            <HPBoxDesktop character={character} gameId={gameId} onOpenModal={() => setHpModalOpen(true)} />
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="cs-header-mobile">
          {/* Expandable content */}
          {expanded && (
            <div className="cs-mobile-expanded">
              <div className="cs-name-block">
                <h1 className="cs-name">{character.name}</h1>
                <button className="cs-settings-btn" onClick={() => setSettingsOpen(true)}>
                  ⚙️
                </button>
              </div>
              <p className="cs-subtitle">
                {character.race} — {character.class} {character.subclass && `(${character.subclass})`}
              </p>

              <button
                className="cs-level-btn-mobile"
                onClick={() => setLevelModalOpen(true)}
              >
                Level {character.level}
              </button>

              {/* 4 stat blocks */}
              <div className="cs-expanded-stats">
                <div
                  className="cs-mini-stat"
                  style={{ cursor: 'pointer' }}
                  onClick={async () => {
                    await updateCharacter(gameId, character.id, {
                      inspiration: !character.inspiration,
                    });
                  }}
                >
                  <div className="cs-mini-label">Inspiration</div>
                  <div className="cs-mini-value">{character.inspiration ? '✓' : '—'}</div>
                </div>
                <div className="cs-mini-stat">
                  <div className="cs-mini-label">Initiative</div>
                  <div className="cs-mini-value">
                    {initiativeModifier >= 0 ? '+' : ''}{initiativeModifier}
                  </div>
                </div>
                <div
                  className="cs-mini-stat"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setConditionsOpen(true)}
                >
                  <div className="cs-mini-label">Conditions</div>
                  <div className="cs-mini-value">{conditionsCount > 0 ? conditionsCount : '—'}</div>
                </div>
                <div className="cs-mini-stat">
                  <div className="cs-mini-label">Exhaustion</div>
                  <select
                    className="cs-mini-value cs-exhaustion-select"
                    value={character.exhaustion || 0}
                    onChange={async (e) => {
                      await updateCharacter(gameId, character.id, {
                        exhaustion: Number(e.target.value),
                      });
                    }}
                  >
                    {[0, 1, 2, 3, 4, 5, 6].map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Always visible stats */}
          <div className="cs-quick-stats-mobile">
            <div className="cs-combat-stats-mobile">
              <div className="cs-stat-item">
                <div className="cs-stat-value cs-bordered">{character.ac}</div>
                <div className="cs-stat-label">Armor</div>
              </div>
              <div className="cs-stat-item">
                <div className="cs-stat-value">{character.speed}</div>
                <div className="cs-stat-label">Speed</div>
              </div>
            </div>

            <HPBoxMobile character={character} onClick={() => setHpModalOpen(true)} />
          </div>

          {/* Collapse toggle - mobile only */}
          <button className="cs-collapse-btn" onClick={onToggleExpand}>
            {expanded ? 'Collapse ▲' : 'Expand ▼'}
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {settingsOpen && (
        <SettingsModal
          character={character}
          gameId={gameId}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      {/* Level/XP Modal */}
      {levelModalOpen && (
        <LevelXPModal
          character={character}
          gameId={gameId}
          onClose={() => setLevelModalOpen(false)}
        />
      )}

      {/* HP Modal */}
      {hpModalOpen && (
        <HPModal
          character={character}
          gameId={gameId}
          onClose={() => setHpModalOpen(false)}
        />
      )}

      {/* Conditions Modal */}
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
