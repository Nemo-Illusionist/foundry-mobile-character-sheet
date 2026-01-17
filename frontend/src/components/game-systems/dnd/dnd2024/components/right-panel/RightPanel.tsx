// D&D 2024 - Right Panel Component (Desktop/Wide Tablet)

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import { getAbilityModifier } from '../../../core/utils/calculations';
import { ConditionsModal } from '../modals/ConditionsModal';
import type { Character } from 'shared';
import './RightPanel.css';

interface RightPanelProps {
  character: Character;
  gameId: string;
}

export function RightPanel({ character, gameId }: RightPanelProps) {
  const [conditionsOpen, setConditionsOpen] = useState(false);

  const initiativeModifier = getAbilityModifier(character.abilities.dex);
  const activeConditions = character.conditions || [];

  return (
    <div className="cs-right-panel">
      {/* Stats row: Inspiration, Initiative, Exhaustion, Conditions */}
      <div className="cs-right-stats-row">
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
