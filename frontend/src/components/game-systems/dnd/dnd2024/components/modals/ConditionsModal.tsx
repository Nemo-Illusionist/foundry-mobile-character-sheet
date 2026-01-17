// D&D 2024 - Conditions Modal Component

import { CONDITIONS } from '../../constants/conditions';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character, ConditionName } from 'shared';
import './Modals.css';

interface ConditionsModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function ConditionsModal({ character, gameId, onClose }: ConditionsModalProps) {
  const activeConditions = character.conditions || [];

  const toggleCondition = async (conditionName: ConditionName) => {
    const isActive = activeConditions.includes(conditionName);
    const newConditions = isActive
      ? activeConditions.filter((c) => c !== conditionName)
      : [...activeConditions, conditionName];

    await updateCharacter(gameId, character.id, {
      conditions: newConditions,
    });
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Conditions</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-conditions-list">
            {CONDITIONS.map((condition) => {
              const isActive = activeConditions.includes(condition.name);
              return (
                <div
                  key={condition.name}
                  className={`cs-condition-row ${isActive ? 'active' : ''}`}
                  onClick={() => toggleCondition(condition.name)}
                >
                  <div className="cs-condition-checkbox">
                    {isActive ? '✓' : ''}
                  </div>
                  <div className="cs-condition-info">
                    <div className="cs-condition-name">{condition.name}</div>
                    <div className="cs-condition-desc">{condition.description}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
