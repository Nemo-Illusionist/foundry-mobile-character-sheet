// D&D 2024 - Spells Tab Component (D&D Beyond style)
// Supports multiclass with multiple spellcasting abilities and Pact Magic

import { FilterButton } from '../../../../../shared';
import { ABILITY_NAMES } from '../../constants';
import { formatCastingTime } from '../../utils';
import { useSpells } from '../../hooks';
import { SpellModal } from './SpellModal';
import type { Character } from 'shared';
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

export function SpellsTab({ character, gameId }: SpellsTabProps) {
  const {
    editingSpell,
    setEditingSpell,
    filter,
    setFilter,
    expandedLevels,
    toggleLevel,
    spells,
    spellSlots,
    pactMagicSlots,
    spellsByLevel,
    preparedCount,
    spellSaveDC,
    spellAttackBonus,
    abilityStats,
    addSpell,
    updateSpell,
    deleteSpell,
    useSpellSlot,
    usePactMagicSlot,
  } = useSpells(character, gameId);

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
