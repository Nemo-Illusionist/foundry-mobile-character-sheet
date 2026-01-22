// D&D 2024 - Spells Tab Component (D&D Beyond style)

import { useState, useEffect, useRef } from 'react';
import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core';
import { ABILITY_ORDER, ABILITY_NAMES, getSpellSlotsForLevel, CASTER_TYPE_NAMES } from '../../constants';
import type { SpellcasterType } from '../../constants';
import { SpellModal } from './SpellModal';
import type { Character, CharacterSpellEntry, AbilityName } from 'shared';
import './SpellsTab.scss';

interface SpellsTabProps {
  character: Character;
  gameId: string;
}

const SPELL_LEVELS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const;
const LEVEL_NAMES: Record<number, string> = {
  0: 'Cantrips',
  1: '1st Level',
  2: '2nd Level',
  3: '3rd Level',
  4: '4th Level',
  5: '5th Level',
  6: '6th Level',
  7: '7th Level',
  8: '8th Level',
  9: '9th Level',
};

type FilterType = 'all' | 'prepared' | 'ritual';

// Shorten casting time for table display
function formatCastingTime(time: string | undefined): string {
  if (!time) return '—';
  const lower = time.toLowerCase();
  if (lower === '1 action') return '1A';
  if (lower === '1 bonus action') return '1BA';
  if (lower === '1 reaction') return '1R';
  if (lower.endsWith(' minute')) return time.replace(' minute', 'm');
  if (lower.endsWith(' minutes')) return time.replace(' minutes', 'm');
  if (lower.endsWith(' hour')) return time.replace(' hour', 'h');
  if (lower.endsWith(' hours')) return time.replace(' hours', 'h');
  return time;
}

export function SpellsTab({ character, gameId }: SpellsTabProps) {
  const [editingSpell, setEditingSpell] = useState<CharacterSpellEntry | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1]));
  const [showSettings, setShowSettings] = useState(false);
  const prevLevelRef = useRef(character.level);
  const prevCasterTypeRef = useRef(character.spellcasterType);

  const spells = character.spellEntries || [];
  const spellSlots = character.spellSlots || {};
  const spellcastingAbility = character.spellcastingAbility || 'int';
  const spellcasterType = (character.spellcasterType || 'none') as SpellcasterType;
  const showAllSpellLevels = character.showAllSpellLevels || false;

  // Calculate spellcasting stats
  const abilityScore = character.abilities[spellcastingAbility];
  const spellModifier = getAbilityModifier(abilityScore);
  const spellSaveDC = 8 + character.proficiencyBonus + spellModifier;
  const spellAttackBonus = character.proficiencyBonus + spellModifier;

  // Determine max available spell level based on slots
  const maxSlotLevel = Math.max(0, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter((l) => (spellSlots[l]?.max || 0) > 0));

  // Auto-update spell slots when level or caster type changes (only for auto types)
  useEffect(() => {
    const levelChanged = prevLevelRef.current !== character.level;
    const casterTypeChanged = prevCasterTypeRef.current !== character.spellcasterType;
    const isAutoType = spellcasterType === 'full' || spellcasterType === 'half' || spellcasterType === 'warlock';

    if ((levelChanged || casterTypeChanged) && isAutoType) {
      const newSlots = getSpellSlotsForLevel(spellcasterType, character.level);
      updateCharacter(gameId, character.id, { spellSlots: newSlots });
    }

    prevLevelRef.current = character.level;
    prevCasterTypeRef.current = character.spellcasterType;
  }, [character.level, character.spellcasterType, spellcasterType, gameId, character.id]);

  // Filter spells
  const filteredSpells = spells.filter((spell) => {
    if (filter === 'prepared') return spell.prepared || spell.level === 0;
    if (filter === 'ritual') return spell.ritual;
    return true;
  });

  // Group spells by level
  const spellsByLevel = SPELL_LEVELS.reduce((acc, level) => {
    acc[level] = filteredSpells.filter((s) => s.level === level);
    return acc;
  }, {} as Record<number, CharacterSpellEntry[]>);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const toggleLevel = (level: number) => {
    const newExpanded = new Set(expandedLevels);
    if (newExpanded.has(level)) {
      newExpanded.delete(level);
    } else {
      newExpanded.add(level);
    }
    setExpandedLevels(newExpanded);
  };

  const addSpell = async (level: number = 0) => {
    const newSpell: CharacterSpellEntry = {
      id: generateId(),
      name: 'New Spell',
      level,
      prepared: level === 0, // Cantrips are always prepared
    };
    await updateCharacter(gameId, character.id, {
      spellEntries: [...spells, newSpell],
    });
    setEditingSpell(newSpell);
  };

  const updateSpell = async (id: string, updates: Partial<CharacterSpellEntry>) => {
    const updatedSpells = spells.map((s) =>
      s.id === id ? { ...s, ...updates } : s
    );
    await updateCharacter(gameId, character.id, {
      spellEntries: updatedSpells,
    });
  };

  const deleteSpell = async (id: string) => {
    // Close modal immediately for responsive UI
    setEditingSpell(null);
    // Delete in background
    await updateCharacter(gameId, character.id, {
      spellEntries: spells.filter((s) => s.id !== id),
    });
  };

  const useSpellSlot = async (level: number, delta: number) => {
    const slot = spellSlots[level] || { current: 0, max: 0 };
    const newCurrent = Math.max(0, Math.min(slot.max, slot.current + delta));
    await updateCharacter(gameId, character.id, {
      spellSlots: {
        ...spellSlots,
        [level]: { ...slot, current: newCurrent },
      },
    });
  };

  // Count prepared spells (excluding cantrips)
  const preparedCount = spells.filter((s) => s.prepared && s.level > 0).length;

  const handleSpellcastingAbilityChange = async (ability: AbilityName) => {
    await updateCharacter(gameId, character.id, {
      spellcastingAbility: ability,
    });
  };

  const handleCasterTypeChange = async (type: SpellcasterType) => {
    if (type === 'none') {
      // Clear all slots
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
        spellSlots: {},
      });
    } else if (type === 'manual') {
      // Keep current slots, just change type
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
      });
    } else {
      // Auto types - set slots based on level
      const newSlots = getSpellSlotsForLevel(type, character.level);
      await updateCharacter(gameId, character.id, {
        spellcasterType: type,
        spellSlots: newSlots,
      });
    }
  };

  const handleShowAllSpellLevelsChange = async (show: boolean) => {
    await updateCharacter(gameId, character.id, {
      showAllSpellLevels: show,
    });
  };

  const handleSlotMaxChange = async (level: number, max: number) => {
    const slot = spellSlots[level] || { current: 0, max: 0 };
    await updateCharacter(gameId, character.id, {
      spellSlots: {
        ...spellSlots,
        [level]: { current: Math.min(slot.current, max), max },
      },
    });
  };

  const isNone = spellcasterType === 'none';
  const isManual = spellcasterType === 'manual';

  return (
    <div className="cs-spells-tab">
      {/* Spellcasting Stats - hidden for None */}
      {!isNone && (
        <div className="cs-spellcasting-stats">
          <div className="cs-spellcasting-stat">
            <span className="cs-stat-label">Ability</span>
            <span className="cs-stat-value cs-stat-ability">{ABILITY_NAMES[spellcastingAbility].slice(0, 3).toUpperCase()}</span>
          </div>
          <div className="cs-spellcasting-stat">
            <span className="cs-stat-label">Modifier</span>
            <span className="cs-stat-value">{spellModifier >= 0 ? '+' : ''}{spellModifier}</span>
          </div>
          <div className="cs-spellcasting-stat">
            <span className="cs-stat-label">Save DC</span>
            <span className="cs-stat-value">{spellSaveDC}</span>
          </div>
          <div className="cs-spellcasting-stat">
            <span className="cs-stat-label">Attack</span>
            <span className="cs-stat-value">{spellAttackBonus >= 0 ? '+' : ''}{spellAttackBonus}</span>
          </div>
          <button
            className="cs-slot-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Spellcasting"
          >
            ⚙
          </button>
        </div>
      )}

      {/* Settings button for None type */}
      {isNone && (
        <div className="cs-spellcasting-none">
          <span>No spellcasting configured</span>
          <button
            className="cs-slot-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            title="Configure Spellcasting"
          >
            ⚙
          </button>
        </div>
      )}

      {/* Spellcasting Settings */}
      {showSettings && (
        <div className="cs-slot-settings">
          {/* Caster Type Selection */}
          <div className="cs-settings-row">
            <label>Caster Type</label>
            <select
              value={spellcasterType}
              onChange={(e) => handleCasterTypeChange(e.target.value as SpellcasterType)}
            >
              {(Object.keys(CASTER_TYPE_NAMES) as SpellcasterType[]).map((type) => (
                <option key={type} value={type}>{CASTER_TYPE_NAMES[type]}</option>
              ))}
            </select>
          </div>

          {/* Ability Selection - only for non-None */}
          {!isNone && (
            <div className="cs-settings-row">
              <label>Spellcasting Ability</label>
              <select
                value={spellcastingAbility}
                onChange={(e) => handleSpellcastingAbilityChange(e.target.value as AbilityName)}
              >
                {ABILITY_ORDER.map((ab) => (
                  <option key={ab} value={ab}>{ABILITY_NAMES[ab]}</option>
                ))}
              </select>
            </div>
          )}

          {/* Manual Spell Slots - only for Manual type */}
          {isManual && (
            <>
              <div className="cs-slot-settings-header">Spell Slots (Max)</div>
              <div className="cs-slot-settings-grid">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
                  const slot = spellSlots[level] || { current: 0, max: 0 };
                  return (
                    <div key={level} className="cs-slot-setting">
                      <span className="cs-slot-setting-level">{level}</span>
                      <NumberInput
                        className="cs-slot-setting-input"
                        value={slot.max}
                        onChange={(val) => handleSlotMaxChange(level, val)}
                        min={0}
                        max={9}
                        defaultValue={0}
                      />
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* Show all spell levels checkbox */}
          {!isNone && (
            <div className="cs-settings-row cs-checkbox-row">
              <label className="cs-checkbox-label">
                <input
                  type="checkbox"
                  checked={showAllSpellLevels}
                  onChange={(e) => handleShowAllSpellLevelsChange(e.target.checked)}
                />
                <span>Show all spell levels</span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Spell Slots Header */}
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].some((level) => (spellSlots[level]?.max || 0) > 0) && (
        <div className="cs-spell-slots-row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = spellSlots[level] || { current: 0, max: 0 };
            if (slot.max === 0) return null;
            return (
              <div key={level} className="cs-spell-slot">
                <div className="cs-slot-level">{level}</div>
                <div className="cs-slot-pips">
                  {Array.from({ length: slot.max }).map((_, i) => (
                    <div
                      key={i}
                      className={`cs-slot-pip ${i < slot.current ? 'filled' : ''}`}
                      onClick={() => useSpellSlot(level, i < slot.current ? -1 : 1)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="cs-spell-filters">
        <button
          className={`cs-filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({spells.length})
        </button>
        <button
          className={`cs-filter-btn ${filter === 'prepared' ? 'active' : ''}`}
          onClick={() => setFilter('prepared')}
        >
          Prepared ({preparedCount})
        </button>
        <button
          className={`cs-filter-btn ${filter === 'ritual' ? 'active' : ''}`}
          onClick={() => setFilter('ritual')}
        >
          Ritual
        </button>
      </div>

      {/* Spells by level */}
      <div className="cs-spells-list">
        {SPELL_LEVELS.map((level) => {
          const levelSpells = spellsByLevel[level];

          // Hide spell levels without slots unless showAllSpellLevels is true
          // Always show cantrips (level 0) and levels with spells
          const hasSlots = level === 0 || (spellSlots[level]?.max || 0) > 0;
          const hasSpells = levelSpells.length > 0;
          const shouldShow = showAllSpellLevels || hasSlots || hasSpells || level <= maxSlotLevel;

          if (!shouldShow) return null;
          if (levelSpells.length === 0 && filter !== 'all') return null;

          const isExpanded = expandedLevels.has(level);
          const slot = spellSlots[level];

          return (
            <div key={level} className="cs-spell-level-group">
              <div
                className="cs-spell-level-header"
                onClick={() => toggleLevel(level)}
              >
                <span className="cs-level-toggle">{isExpanded ? '▼' : '▶'}</span>
                <span className="cs-level-name">{LEVEL_NAMES[level]}</span>
                <span className="cs-level-count">{levelSpells.length}</span>
                {level > 0 && slot && slot.max > 0 && (
                  <span className="cs-level-slots">
                    {slot.current}/{slot.max}
                  </span>
                )}
              </div>

              {isExpanded && (
                <div className="cs-spell-level-content">
                  <table className="cs-data-table cs-spells-table">
                    <thead>
                      <tr>
                        <th className="cs-col-name">Name</th>
                        <th className="cs-col-time">Time</th>
                        <th className="cs-col-range">Range</th>
                        <th className="cs-col-hit">Hit/DC</th>
                        <th className="cs-col-effect">Effect</th>
                        <th className="cs-col-notes">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {levelSpells.map((spell) => {
                        // Build Hit/DC display
                        let hitDcDisplay: React.ReactNode = '—';
                        if (spell.attackType === 'attack') {
                          hitDcDisplay = spellAttackBonus >= 0 ? `+${spellAttackBonus}` : `${spellAttackBonus}`;
                        } else if (spell.attackType === 'save' && spell.saveAbility) {
                          const abilityAbbr = spell.saveAbility.toUpperCase();
                          hitDcDisplay = (
                            <div className="cs-save-dc">
                              <span className="cs-save-ability">{abilityAbbr}</span>
                              <span className="cs-save-value">{spellSaveDC}</span>
                            </div>
                          );
                        }

                        // Build Notes display
                        const notes: string[] = [];
                        if (spell.concentration) notes.push('C');
                        if (spell.ritual) notes.push('R');
                        const components: string[] = [];
                        if (spell.componentV) components.push('V');
                        if (spell.componentS) components.push('S');
                        if (spell.componentM) components.push('M');
                        if (components.length > 0) notes.push(components.join('/'));

                        return (
                          <tr
                            key={spell.id}
                            className={`cs-table-row ${spell.prepared ? 'prepared' : ''}`}
                            onClick={() => setEditingSpell(spell)}
                          >
                            <td className="cs-cell-name">{spell.name}</td>
                            <td className="cs-cell-time">{formatCastingTime(spell.castingTime)}</td>
                            <td className="cs-cell-range">{spell.range || '—'}</td>
                            <td className="cs-cell-hit">{hitDcDisplay}</td>
                            <td className="cs-cell-effect">{spell.damage || '—'}</td>
                            <td className="cs-cell-notes">{notes.join(', ') || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <button
                    className="cs-table-add-btn"
                    onClick={() => addSpell(level)}
                  >
                    + Add {level === 0 ? 'Cantrip' : 'Spell'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editingSpell && (
        <SpellModal
          spell={editingSpell}
          onUpdate={(updates) => updateSpell(editingSpell.id, updates)}
          onDelete={() => deleteSpell(editingSpell.id)}
          onClose={() => setEditingSpell(null)}
        />
      )}
    </div>
  );
}
