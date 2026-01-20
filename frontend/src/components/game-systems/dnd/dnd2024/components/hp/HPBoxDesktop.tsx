// D&D 2024 - HP Box Desktop Component

import { useState } from 'react';
import { NumberInput } from '../../../../../shared';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character } from 'shared';
import './HP.scss';

interface HPBoxDesktopProps {
  character: Character;
  gameId: string;
  onOpenModal: () => void;
}

export function HPBoxDesktop({ character, gameId, onOpenModal }: HPBoxDesktopProps) {
  const [healAmount, setHealAmount] = useState(0);

  const effectiveMaxHP = character.hp.max + (character.hpBonus || 0);

  const handleDamage = async () => {
    if (healAmount <= 0) return;

    let remaining = healAmount;
    let newTemp = character.hp.temp;
    let newCurrent = character.hp.current;

    // Apply to temp HP first
    if (newTemp > 0) {
      if (newTemp >= remaining) {
        newTemp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTemp;
        newTemp = 0;
      }
    }

    // Apply remaining to current HP
    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }

    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent, temp: newTemp },
    });
    setHealAmount(0);
  };

  const handleHeal = async () => {
    if (healAmount <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, character.hp.current + healAmount);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent },
      deathSaves: { successes: 0, failures: 0 }, // Clear death saves on heal
    });
    setHealAmount(0);
  };

  const handleTempHPChange = async (value: number) => {
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, temp: Math.max(0, value) },
    });
  };

  const handleDeathSaveClick = async (type: 'success' | 'failure', index: number) => {
    const current = character.deathSaves || { successes: 0, failures: 0 };
    const currentCount = type === 'success' ? current.successes : current.failures;
    const newCount = currentCount === index + 1 ? index : index + 1;

    await updateCharacter(gameId, character.id, {
      deathSaves: {
        ...current,
        [type === 'success' ? 'successes' : 'failures']: newCount,
      },
    });
  };

  const isDead = character.hp.current === 0;
  const deathSaves = character.deathSaves || { successes: 0, failures: 0 };

  return (
    <div className="cs-hp-box-desktop" onClick={onOpenModal} style={{ cursor: 'pointer' }}>
      {/* Column 1: Heal/Input/Damage group - spans 2 rows */}
      <div className="cs-hp-vertical-group">
        <button
          className="cs-hp-btn-small heal"
          onClick={(e) => {
            e.stopPropagation();
            handleHeal();
          }}
        >
          Heal
        </button>
        <NumberInput
          className="cs-hp-input-small"
          value={healAmount}
          onChange={setHealAmount}
          onClick={(e) => e.stopPropagation()}
          min={0}
          defaultValue={0}
          placeholder="0"
        />
        <button
          className="cs-hp-btn-small damage"
          onClick={(e) => {
            e.stopPropagation();
            handleDamage();
          }}
        >
          Damage
        </button>
      </div>

      {isDead ? (
        <div className="cs-death-saves-both-rows">
          {/* Row 1: Success circles (horizontal) */}
          <div className="cs-death-saves-circles-horizontal">
            {[0, 1, 2].map((i) => (
              <div
                key={`success-${i}`}
                className={`cs-death-save-circle cs-success ${i < deathSaves.successes ? 'filled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeathSaveClick('success', i);
                }}
              />
            ))}
          </div>

          {/* Row 2: Failure circles (horizontal) */}
          <div className="cs-death-saves-circles-horizontal">
            {[0, 1, 2].map((i) => (
              <div
                key={`failure-${i}`}
                className={`cs-death-save-circle cs-failure ${i < deathSaves.failures ? 'filled' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeathSaveClick('failure', i);
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* Column 2, Row 1: Hit Points label */}
          <div className="cs-hp-label">Hit Points</div>

          {/* Column 3, Row 1: TEMP label */}
          <div className="cs-hp-label-temp">TEMP</div>

          {/* Column 2, Row 2: Current/Max HP display */}
          <div className="cs-hp-display-large">
            <span className="cs-hp-current">{character.hp.current}</span>
            <span className="cs-hp-separator">/</span>
            <span className="cs-hp-max">{effectiveMaxHP}</span>
            {character.hp.temp > 0 && (
              <span className="cs-hp-temp-inline">({character.hp.temp})</span>
            )}
          </div>

          {/* Column 3, Row 2: Temp HP input (centered) */}
          <div className="cs-hp-temp-input-wrapper">
            <NumberInput
              className="cs-hp-input-small"
              value={character.hp.temp}
              onChange={handleTempHPChange}
              onClick={(e) => e.stopPropagation()}
              min={0}
              defaultValue={0}
            />
          </div>
        </>
      )}
    </div>
  );
}
