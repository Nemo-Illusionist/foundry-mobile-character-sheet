// D&D 2024 - HP Modal Component

import { useState } from 'react';
import { updateCharacter } from '../../../../../../services/characters.service';
import type { Character } from 'shared';
import './HP.css';

interface HPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function HPModal({ character, gameId, onClose }: HPModalProps) {
  const [currentHP, setCurrentHP] = useState(character.hp.current);
  const [tempHP, setTempHP] = useState(character.hp.temp);
  const [amount, setAmount] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [maxHP, setMaxHP] = useState(character.hp.max);
  const [hpBonus, setHpBonus] = useState(character.hpBonus || 0);
  const [hitDice, setHitDice] = useState(character.hitDice || 'd8');

  const effectiveMaxHP = maxHP + hpBonus;

  const handleDamage = async () => {
    const dmg = parseInt(amount) || 0;
    if (dmg <= 0) return;

    let remaining = dmg;
    let newTemp = tempHP;
    let newCurrent = currentHP;

    if (newTemp > 0) {
      if (newTemp >= remaining) {
        newTemp -= remaining;
        remaining = 0;
      } else {
        remaining -= newTemp;
        newTemp = 0;
      }
    }

    if (remaining > 0) {
      newCurrent = Math.max(0, newCurrent - remaining);
    }

    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent, temp: newTemp },
    });
    setCurrentHP(newCurrent);
    setTempHP(newTemp);
    setAmount('');
  };

  const handleHeal = async () => {
    const heal = parseInt(amount) || 0;
    if (heal <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, currentHP + heal);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: newCurrent },
      deathSaves: { successes: 0, failures: 0 },
    });
    setCurrentHP(newCurrent);
    setAmount('');
  };

  const handleUpdateMaxHP = async (newMax: number) => {
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, max: newMax },
    });
  };

  const handleUpdateHPBonus = async (newBonus: number) => {
    await updateCharacter(gameId, character.id, {
      hpBonus: newBonus,
    });
  };

  const handleUpdateHitDice = async (newHitDice: string) => {
    await updateCharacter(gameId, character.id, {
      hitDice: newHitDice,
    });
  };

  const handleUpdateCurrentHP = async (newCurrent: number) => {
    // Clamp between 0 and effectiveMaxHP
    const clampedHP = Math.max(0, Math.min(effectiveMaxHP, newCurrent));
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, current: clampedHP },
    });
    if (clampedHP !== newCurrent) {
      setCurrentHP(clampedHP);
    }
  };

  const handleUpdateTempHP = async (newTemp: number) => {
    const clampedTemp = Math.max(0, newTemp);
    await updateCharacter(gameId, character.id, {
      hp: { ...character.hp, temp: clampedTemp },
    });
    if (clampedTemp !== newTemp) {
      setTempHP(clampedTemp);
    }
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-header">
          <h2>Hit Points</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-hp-modal-main">
            <div className="cs-hp-modal-row">
              <label>HP</label>
              <input
                type="number"
                value={currentHP}
                onChange={(e) => {
                  const newHP = parseInt(e.target.value) || 0;
                  setCurrentHP(newHP);
                  handleUpdateCurrentHP(newHP);
                }}
              />
              <span className="cs-hp-modal-max">/ {effectiveMaxHP}</span>
            </div>

            <div className="cs-hp-modal-row">
              <label>TEMP</label>
              <input
                type="number"
                value={tempHP}
                onChange={(e) => {
                  const newTemp = parseInt(e.target.value) || 0;
                  setTempHP(newTemp);
                  handleUpdateTempHP(newTemp);
                }}
              />
            </div>

            {currentHP === 0 && (
              <div className="cs-hp-modal-death-saves">
                <div className="cs-death-saves-checkboxes">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`success-${i}`}
                      className={`cs-death-save-checkbox cs-success ${
                        i < (character.deathSaves?.successes || 0) ? 'checked' : ''
                      }`}
                      onClick={async () => {
                        const current = character.deathSaves || { successes: 0, failures: 0 };
                        const newCount = current.successes === i + 1 ? i : i + 1;
                        await updateCharacter(gameId, character.id, {
                          deathSaves: { ...current, successes: newCount },
                        });
                      }}
                    />
                  ))}
                  {[0, 1, 2].map((i) => (
                    <div
                      key={`failure-${i}`}
                      className={`cs-death-save-checkbox cs-failure ${
                        i < (character.deathSaves?.failures || 0) ? 'checked' : ''
                      }`}
                      onClick={async () => {
                        const current = character.deathSaves || { successes: 0, failures: 0 };
                        const newCount = current.failures === i + 1 ? i : i + 1;
                        await updateCharacter(gameId, character.id, {
                          deathSaves: { ...current, failures: newCount },
                        });
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="cs-hp-modal-actions">
              <button className="cs-hp-btn-heal" onClick={handleHeal}>Heal</button>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <button className="cs-hp-btn-damage" onClick={handleDamage}>Damage</button>
            </div>
          </div>

          <div className="cs-hp-modal-settings">
            <button
              className="cs-hp-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
            >
              {showSettings ? '▼' : '▶'} HP Settings
            </button>
            {showSettings && (
              <div className="cs-hp-settings-content">
                <div className="cs-hp-modal-row">
                  <label>Max HP</label>
                  <input
                    type="number"
                    value={maxHP}
                    onChange={(e) => {
                      const newMax = parseInt(e.target.value) || 0;
                      setMaxHP(newMax);
                      handleUpdateMaxHP(newMax);
                    }}
                  />
                </div>
                <div className="cs-hp-modal-row">
                  <label>HP Bonus</label>
                  <input
                    type="number"
                    value={hpBonus}
                    onChange={(e) => {
                      const newBonus = parseInt(e.target.value) || 0;
                      setHpBonus(newBonus);
                      handleUpdateHPBonus(newBonus);
                    }}
                    placeholder="0"
                  />
                </div>
                <div className="cs-hp-modal-row">
                  <label>Hit Dice</label>
                  <select
                    value={hitDice}
                    onChange={(e) => {
                      setHitDice(e.target.value);
                      handleUpdateHitDice(e.target.value);
                    }}
                  >
                    <option value="d6">d6</option>
                    <option value="d8">d8</option>
                    <option value="d10">d10</option>
                    <option value="d12">d12</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
