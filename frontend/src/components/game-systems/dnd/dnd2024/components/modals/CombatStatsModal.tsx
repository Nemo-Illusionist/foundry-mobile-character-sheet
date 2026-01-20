// D&D 2024 - Combat Stats Modal Component (AC, Speed, Initiative)

import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core';
import type { Character } from 'shared';
import './Modals.scss';

interface CombatStatsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function CombatStatsModal({ character, gameId, onClose }: CombatStatsModalProps) {
  const update = (changes: Partial<Character>) => {
    updateCharacter(gameId, character.id, changes);
  };

  const dexModifier = getAbilityModifier(character.abilities.dex);
  const totalAC = character.ac + (character.shield || 0);
  const displayedInitiative = character.initiativeOverride ?? dexModifier;

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content cs-combat-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header cs-no-border">
          <h2>Combat Stats</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          {/* Armor Class Section */}
          <div className="cs-section-header">
            <span className="cs-section-title">Armor Class</span>
            <span className="cs-section-total">{totalAC}</span>
          </div>
          <div className="cs-stats-row">
            <label>Armor</label>
            <NumberInput
              value={character.ac}
              onChange={(value) => update({ ac: value })}
              min={0}
              defaultValue={10}
            />
            <label>Shield</label>
            <NumberInput
              value={character.shield || 0}
              onChange={(value) => update({ shield: value })}
              min={0}
              defaultValue={0}
            />
          </div>

          <hr className="cs-divider" />

          {/* Speed & Initiative Section */}
          <div className="cs-section-header">
            <span className="cs-section-title">Movement & Initiative</span>
          </div>
          <div className="cs-stats-row">
            <label>Speed</label>
            <NumberInput
              value={character.speed}
              onChange={(value) => update({ speed: value })}
              min={0}
              defaultValue={30}
            />
            <label>Initiative</label>
            <input
              type="number"
              value={character.initiativeOverride ?? ''}
              onChange={(e) => {
                const val = e.target.value;
                update({
                  initiativeOverride: val === '' ? undefined : Number(val)
                });
              }}
              placeholder={`${dexModifier >= 0 ? '+' : ''}${dexModifier}`}
            />
          </div>
          <p className="cs-hint">
            Initiative: {displayedInitiative >= 0 ? '+' : ''}{displayedInitiative}
            {character.initiativeOverride === undefined && ' (DEX modifier)'}
          </p>
        </div>
      </div>
    </div>
  );
}
