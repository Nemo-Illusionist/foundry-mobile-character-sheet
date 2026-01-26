// D&D 2024 - Spells Tab Component (D&D Beyond style)
// Supports multiclass with multiple spellcasting abilities and Pact Magic

import { useState } from 'react';
import { FilterButton } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core';
import { ABILITY_NAMES } from '../../constants';
import { getSpellcastingClasses } from '../../utils';
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

// Calculate spellcasting stats for a given ability
function calculateSpellStats(character: Character, ability: AbilityName) {
  const abilityScore = character.abilities[ability];
  const spellModifier = getAbilityModifier(abilityScore);
  const spellSaveDC = 8 + character.proficiencyBonus + spellModifier;
  const spellAttackBonus = character.proficiencyBonus + spellModifier;
  return { spellModifier, spellSaveDC, spellAttackBonus };
}

export function SpellsTab({ character, gameId }: SpellsTabProps) {
  const [editingSpell, setEditingSpell] = useState<CharacterSpellEntry | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1]));

  const spellcastingClasses = getSpellcastingClasses(character);
  const spells = character.spellEntries || [];
  const spellSlots = character.spellSlots || {};
  const pactMagicSlots = character.pactMagicSlots;

  // Get unique spellcasting abilities from all classes (including warlock)
  const spellcastingAbilities = [...new Set(
    spellcastingClasses
      .map(c => c.spellcastingAbility || (c.spellcasterType === 'warlock' ? 'cha' : 'int'))
  )];

  // For spell display, use primary (first) ability
  const primaryAbility: AbilityName = spellcastingAbilities[0] || 'int';
  const { spellSaveDC, spellAttackBonus } = calculateSpellStats(character, primaryAbility);

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

  const usePactMagicSlot = async (delta: number) => {
    if (!pactMagicSlots) return;
    const newCurrent = Math.max(0, Math.min(pactMagicSlots.max, pactMagicSlots.current + delta));
    await updateCharacter(gameId, character.id, {
      pactMagicSlots: { ...pactMagicSlots, current: newCurrent },
    });
  };

  // Count prepared spells (excluding cantrips)
  const preparedCount = spells.filter((s) => s.prepared && s.level > 0).length;

  // Calculate stats for each spellcasting ability
  const abilityStats = spellcastingAbilities.map(ability => ({
    ability,
    ...calculateSpellStats(character, ability),
  }));

  return (
    <div className="cs-spells-tab">
      {/* Spellcasting Stats - show all abilities for multiclass */}
      {abilityStats.length > 0 && (
        <div className="cs-spellcasting-stats-container">
          {abilityStats.map(({ ability, spellModifier: mod, spellSaveDC: dc, spellAttackBonus: atk }) => (
            <div key={ability} className="cs-spellcasting-stats">
              <div className="cs-spellcasting-stat">
                <span className="cs-stat-label">Ability</span>
                <span className="cs-stat-value cs-stat-ability">{ABILITY_NAMES[ability].slice(0, 3).toUpperCase()}</span>
              </div>
              <div className="cs-spellcasting-stat">
                <span className="cs-stat-label">Modifier</span>
                <span className="cs-stat-value">{mod >= 0 ? '+' : ''}{mod}</span>
              </div>
              <div className="cs-spellcasting-stat">
                <span className="cs-stat-label">Save DC</span>
                <span className="cs-stat-value">{dc}</span>
              </div>
              <div className="cs-spellcasting-stat">
                <span className="cs-stat-label">Attack</span>
                <span className="cs-stat-value">{atk >= 0 ? '+' : ''}{atk}</span>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Filter tabs */}
      <FilterButton
        options={[
          { id: 'all' as const, label: 'All', count: spells.length },
          { id: 'prepared' as const, label: 'Prepared', count: preparedCount },
          { id: 'ritual' as const, label: 'Ritual' },
        ]}
        value={filter}
        onChange={setFilter}
        size="sm"
        className="cs-spell-filters"
      />

      {/* Spells by level */}
      <div className="cs-spells-list">
        {SPELL_LEVELS.map((level) => {
          const levelSpells = spellsByLevel[level];

          // Hide levels with no spells when filtering
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
                {level > 0 && (pactMagicSlots?.level === level || (slot && slot.max > 0)) && (
                  <div className="cs-header-slots" onClick={(e) => e.stopPropagation()}>
                    {/* Regular spell slots */}
                    {slot && slot.max > 0 && Array.from({ length: slot.max }).map((_, i) => (
                      <div
                        key={i}
                        className={`cs-header-pip ${i < slot.current ? 'filled' : ''}`}
                        onClick={() => useSpellSlot(level, i < slot.current ? -1 : 1)}
                      />
                    ))}
                    {/* Pact Magic slots (if this is the pact magic level) */}
                    {pactMagicSlots && pactMagicSlots.level === level && (
                      <>
                        {/* Separator if there are also regular slots */}
                        {slot && slot.max > 0 && (
                          <span className="cs-slots-separator">/</span>
                        )}
                        {Array.from({ length: pactMagicSlots.max }).map((_, i) => (
                          <div
                            key={`pact-${i}`}
                            className={`cs-header-pip cs-pact-pip ${i < pactMagicSlots.current ? 'filled' : ''}`}
                            onClick={() => usePactMagicSlot(i < pactMagicSlots.current ? -1 : 1)}
                          />
                        ))}
                      </>
                    )}
                  </div>
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
