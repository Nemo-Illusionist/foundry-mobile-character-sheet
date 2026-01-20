// D&D 2024 - HP Modal Component (Refactored)

import { useState } from 'react';
import { useCharacterMutation } from '../../../../../../hooks';
import { HPDisplay } from './HPDisplay';
import { HealDamageActions } from './HealDamageActions';
import { DeathSavesSection } from './DeathSavesSection';
import { HPSettingsSection } from './HPSettingsSection';
import { HitDiceSection } from './HitDiceSection';
import type { Character } from 'shared';
import './HP.scss';

interface HPModalProps {
  character: Character;
  gameId: string;
  onClose: () => void;
}

export function HPModal({ character, gameId, onClose }: HPModalProps) {
  const [currentHP, setCurrentHP] = useState(character.hp.current);
  const [tempHP, setTempHP] = useState(character.hp.temp);
  const [maxHP, setMaxHP] = useState(character.hp.max);
  const [hpBonus, setHpBonus] = useState(character.hpBonus || 0);
  const [hitDice, setHitDice] = useState(character.hitDice || 'd8');
  const [hitDiceUsed, setHitDiceUsed] = useState(character.hitDiceUsed || 0);
  const [amount, setAmount] = useState(0);
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);
  const [shortRestDiceCount, setShortRestDiceCount] = useState(1);

  // Hit dice total is equal to character level
  const hitDiceTotal = character.level;

  const { update, heal, damage } = useCharacterMutation(gameId, character);

  const effectiveMaxHP = maxHP + hpBonus;

  const handleCurrentHPChange = async (newHP: number) => {
    const clampedHP = Math.max(0, Math.min(effectiveMaxHP, newHP));
    setCurrentHP(clampedHP);
    await update({ hp: { ...character.hp, current: clampedHP } });
  };

  const handleTempHPChange = async (newTemp: number) => {
    const clampedTemp = Math.max(0, newTemp);
    setTempHP(clampedTemp);
    await update({ hp: { ...character.hp, temp: clampedTemp } });
  };

  const handleHeal = async () => {
    if (amount <= 0) return;

    const newCurrent = Math.min(effectiveMaxHP, currentHP + amount);
    setCurrentHP(newCurrent);
    await heal(amount, effectiveMaxHP);
    setAmount(0);
  };

  const handleDamage = async () => {
    if (amount <= 0) return;
    const dmg = amount;

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

    setCurrentHP(newCurrent);
    setTempHP(newTemp);
    await damage(dmg, currentHP, tempHP);
    setAmount(0);
  };

  const handleMaxHPChange = async (newMax: number) => {
    setMaxHP(newMax);
    await update({ hp: { ...character.hp, max: newMax } });
  };

  const handleHPBonusChange = async (newBonus: number) => {
    setHpBonus(newBonus);
    await update({ hpBonus: newBonus });
  };

  const handleHitDiceChange = async (newHitDice: string) => {
    setHitDice(newHitDice);
    await update({ hitDice: newHitDice });
  };

  const handleDeathSaveSuccessChange = async (count: number) => {
    await update({
      deathSaves: { ...(character.deathSaves || { successes: 0, failures: 0 }), successes: count },
    });
  };

  const handleDeathSaveFailureChange = async (count: number) => {
    await update({
      deathSaves: { ...(character.deathSaves || { successes: 0, failures: 0 }), failures: count },
    });
  };

  const handleHitDiceUsedChange = async (newUsed: number) => {
    const clamped = Math.max(0, Math.min(hitDiceTotal, newUsed));
    setHitDiceUsed(clamped);
    await update({ hitDiceUsed: clamped });
  };

  const hitDiceRemaining = hitDiceTotal - hitDiceUsed;

  const openShortRestDialog = () => {
    setShortRestDiceCount(Math.min(1, hitDiceRemaining));
    setShowShortRestDialog(true);
  };

  const handleShortRest = async () => {
    if (shortRestDiceCount <= 0 || shortRestDiceCount > hitDiceRemaining) return;

    // Use hit dice
    const newHitDiceUsed = hitDiceUsed + shortRestDiceCount;
    setHitDiceUsed(newHitDiceUsed);

    // Warlock: restore all spell slots on short rest
    const isWarlock = character.spellcasterType === 'warlock';
    let spellSlotsUpdate: Record<string, { current: number; max: number }> | undefined;

    if (isWarlock) {
      spellSlotsUpdate = {};
      for (const [level, slot] of Object.entries(character.spellSlots || {})) {
        spellSlotsUpdate[level] = { current: slot.max, max: slot.max };
      }
    }

    setShowShortRestDialog(false);
    await update({
      hitDiceUsed: newHitDiceUsed,
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
    });
  };

  const handleLongRest = async () => {
    // 1. Restore HP to max
    setCurrentHP(effectiveMaxHP);
    setTempHP(0); // Temp HP doesn't persist through long rest (PHB)

    // 2. Recover half of hit dice (minimum 1)
    const recovered = Math.max(1, Math.floor(hitDiceTotal / 2));
    const newHitDiceUsed = Math.max(0, hitDiceUsed - recovered);
    setHitDiceUsed(newHitDiceUsed);

    // 3. Restore all spell slots to max
    const restoredSpellSlots: Record<string, { current: number; max: number }> = {};
    for (const [level, slot] of Object.entries(character.spellSlots || {})) {
      restoredSpellSlots[level] = { current: slot.max, max: slot.max };
    }

    // 4. Reduce exhaustion by 1 (minimum 0)
    const currentExhaustion = character.exhaustion || 0;
    const newExhaustion = Math.max(0, currentExhaustion - 1);

    // 5. Reset death saves
    await update({
      hp: { current: effectiveMaxHP, max: maxHP, temp: 0 },
      hitDiceUsed: newHitDiceUsed,
      spellSlots: restoredSpellSlots,
      exhaustion: newExhaustion,
      deathSaves: { successes: 0, failures: 0 },
    });
  };

  return (
    <div className="cs-modal-overlay" onClick={onClose}>
      <div className="cs-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="cs-modal-drag-handle" />
        <div className="cs-modal-header">
          <h2>Hit Points</h2>
          <button className="cs-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="cs-modal-body">
          <div className="cs-hp-modal-main">
            <HPDisplay
              currentHP={currentHP}
              tempHP={tempHP}
              effectiveMaxHP={effectiveMaxHP}
              onCurrentHPChange={handleCurrentHPChange}
              onTempHPChange={handleTempHPChange}
            />

            {currentHP === 0 && (
              <DeathSavesSection
                successes={character.deathSaves?.successes || 0}
                failures={character.deathSaves?.failures || 0}
                onSuccessChange={handleDeathSaveSuccessChange}
                onFailureChange={handleDeathSaveFailureChange}
              />
            )}

            <HealDamageActions
              amount={amount}
              onAmountChange={setAmount}
              onHeal={handleHeal}
              onDamage={handleDamage}
            />

            <HitDiceSection
              hitDice={hitDice}
              total={hitDiceTotal}
              used={hitDiceUsed}
            />

            <div className="cs-rest-buttons">
              <button
                className="cs-short-rest-btn"
                onClick={openShortRestDialog}
                disabled={hitDiceRemaining <= 0}
              >
                ☀️ Short Rest
              </button>
              <button className="cs-long-rest-btn" onClick={handleLongRest}>
                🌙 Long Rest
              </button>
            </div>

            {showShortRestDialog && (
              <div className="cs-short-rest-dialog">
                <div className="cs-short-rest-header">
                  <span>Short Rest</span>
                  <button
                    className="cs-short-rest-close"
                    onClick={() => setShowShortRestDialog(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="cs-short-rest-content">
                  <label>Hit Dice to spend:</label>
                  <div className="cs-short-rest-dice-selector">
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.max(1, shortRestDiceCount - 1))}
                      disabled={shortRestDiceCount <= 1}
                    >
                      −
                    </button>
                    <span className="cs-dice-count">{shortRestDiceCount}</span>
                    <button
                      className="cs-dice-btn"
                      onClick={() => setShortRestDiceCount(Math.min(hitDiceRemaining, shortRestDiceCount + 1))}
                      disabled={shortRestDiceCount >= hitDiceRemaining}
                    >
                      +
                    </button>
                  </div>
                  <small className="cs-short-rest-info">
                    Roll {shortRestDiceCount}{hitDice} + CON mod to heal
                  </small>
                </div>
                <button className="cs-short-rest-confirm" onClick={handleShortRest}>
                  Use {shortRestDiceCount} Hit {shortRestDiceCount === 1 ? 'Die' : 'Dice'}
                </button>
              </div>
            )}
          </div>

          <HPSettingsSection
            maxHP={maxHP}
            hpBonus={hpBonus}
            hitDice={hitDice}
            hitDiceUsed={hitDiceUsed}
            hitDiceTotal={hitDiceTotal}
            onMaxHPChange={handleMaxHPChange}
            onHPBonusChange={handleHPBonusChange}
            onHitDiceChange={handleHitDiceChange}
            onHitDiceUsedChange={handleHitDiceUsedChange}
          />
        </div>
      </div>
    </div>
  );
}
