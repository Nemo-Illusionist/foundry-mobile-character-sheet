// D&D 2024 - Spells Tab Component (D&D Beyond style)

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { SpellModal } from './SpellModal';
import type { Character, CharacterSpellEntry } from 'shared';
import './SpellsTab.css';

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

export function SpellsTab({ character, gameId }: SpellsTabProps) {
  const [editingSpell, setEditingSpell] = useState<CharacterSpellEntry | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1]));

  const spells = character.spellEntries || [];
  const spellSlots = character.spellSlots || {};

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
    if (editingSpell?.id === id) {
      setEditingSpell({ ...editingSpell, ...updates });
    }
  };

  const deleteSpell = async (id: string) => {
    await updateCharacter(gameId, character.id, {
      spellEntries: spells.filter((s) => s.id !== id),
    });
    setEditingSpell(null);
  };

  const togglePrepared = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const spell = spells.find((s) => s.id === id);
    if (spell && spell.level > 0) {
      await updateSpell(id, { prepared: !spell.prepared });
    }
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

  return (
    <div className="cs-spells-tab">
      {/* Spell Slots Header */}
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
                  {levelSpells.map((spell) => (
                    <div
                      key={spell.id}
                      className={`cs-spell-row ${spell.prepared ? 'prepared' : ''} ${spell.concentration ? 'concentration' : ''}`}
                      onClick={() => setEditingSpell(spell)}
                    >
                      {level > 0 && (
                        <div
                          className="cs-spell-prepared"
                          onClick={(e) => togglePrepared(spell.id, e)}
                          title={spell.prepared ? 'Unprepare' : 'Prepare'}
                        >
                          {spell.prepared ? '●' : '○'}
                        </div>
                      )}
                      <div className="cs-spell-name">
                        {spell.name}
                        {spell.concentration && <span className="cs-spell-badge cs-conc">C</span>}
                        {spell.ritual && <span className="cs-spell-badge cs-ritual">R</span>}
                      </div>
                      <div className="cs-spell-casting-time">{spell.castingTime || '—'}</div>
                    </div>
                  ))}
                  <button
                    className="cs-spell-add-btn"
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
