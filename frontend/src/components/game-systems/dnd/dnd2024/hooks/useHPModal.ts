// useHPModal Hook - HP management, death saves, hit dice, rests

import { useState } from 'react';
import { useCharacterMutation } from '../../../../../hooks';
import {
  getClasses,
  getHitDiceByType,
  updateHitDiceUsed,
  applyLongRestHitDiceRecovery,
  isMulticlass,
  getWarlockClass,
} from '../utils';
import type { Character } from 'shared';

export function useHPModal(character: Character, gameId: string) {
  const [currentHP, setCurrentHP] = useState(character.hp.current);
  const [tempHP, setTempHP] = useState(character.hp.temp);
  const [maxHP, setMaxHP] = useState(character.hp.max);
  const [hpBonus, setHpBonus] = useState(character.hpBonus || 0);
  const [amount, setAmount] = useState(0);
  const [showShortRestDialog, setShowShortRestDialog] = useState(false);
  const [shortRestDiceType, setShortRestDiceType] = useState<string>('');
  const [shortRestDiceCount, setShortRestDiceCount] = useState(0);

  const classes = getClasses(character);
  const hitDiceGroups = getHitDiceByType(character);
  const hasMultipleClasses = isMulticlass(character);

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

  const handleHitDiceUsedChange = async (diceType: string, newUsed: number) => {
    const updatedClasses = [...classes];
    let remainingUsed = newUsed;

    for (let i = 0; i < updatedClasses.length; i++) {
      const cls = updatedClasses[i];
      if ((cls.hitDice || 'd8') === diceType) {
        const toUse = Math.min(cls.level, remainingUsed);
        updatedClasses[i] = { ...cls, hitDiceUsed: toUse };
        remainingUsed -= toUse;
      }
    }

    await update({
      classes: updatedClasses,
      hitDiceUsed: updatedClasses[0]?.hitDiceUsed || 0,
    });
  };

  const toggleShortRestDialog = () => {
    if (showShortRestDialog) {
      setShowShortRestDialog(false);
    } else {
      if (hasMultipleClasses) {
        const firstAvailable = hitDiceGroups.find(g => g.total - g.used > 0);
        setShortRestDiceType(firstAvailable?.type || hitDiceGroups[0]?.type || 'd8');
      } else {
        setShortRestDiceType(hitDiceGroups[0]?.type || 'd8');
      }
      setShortRestDiceCount(0);
      setShowShortRestDialog(true);
    }
  };

  const handleShortRest = async () => {
    let updatedClasses = [...classes];

    if (shortRestDiceCount > 0) {
      updatedClasses = updateHitDiceUsed(character, shortRestDiceType, shortRestDiceCount);
    }

    const warlockClass = getWarlockClass(character);
    let pactMagicUpdate: Partial<Character> = {};
    if (warlockClass && character.pactMagicSlots) {
      pactMagicUpdate = {
        pactMagicSlots: {
          ...character.pactMagicSlots,
          current: character.pactMagicSlots.max,
        },
      };
    }

    let spellSlotsUpdate: Record<string, { current: number; max: number }> | undefined;
    if (warlockClass && !hasMultipleClasses) {
      spellSlotsUpdate = {};
      for (const [level, slot] of Object.entries(character.spellSlots || {})) {
        spellSlotsUpdate[level] = { current: slot.max, max: slot.max };
      }
    }

    setShowShortRestDialog(false);
    await update({
      classes: updatedClasses,
      hitDiceUsed: updatedClasses[0]?.hitDiceUsed || 0,
      ...pactMagicUpdate,
      ...(spellSlotsUpdate && { spellSlots: spellSlotsUpdate }),
    });
  };

  const getSelectedTypeRemaining = () => {
    const group = hitDiceGroups.find(g => g.type === shortRestDiceType);
    return group ? group.total - group.used : 0;
  };

  const selectedTypeRemaining = getSelectedTypeRemaining();

  const handleLongRest = async () => {
    setCurrentHP(effectiveMaxHP);
    setTempHP(0);

    const recoveredClasses = applyLongRestHitDiceRecovery(character);

    const restoredSpellSlots: Record<string, { current: number; max: number }> = {};
    for (const [level, slot] of Object.entries(character.spellSlots || {})) {
      restoredSpellSlots[level] = { current: slot.max, max: slot.max };
    }

    let pactMagicUpdate: Partial<Character> = {};
    if (character.pactMagicSlots) {
      pactMagicUpdate = {
        pactMagicSlots: {
          ...character.pactMagicSlots,
          current: character.pactMagicSlots.max,
        },
      };
    }

    const currentExhaustion = character.exhaustion || 0;
    const newExhaustion = Math.max(0, currentExhaustion - 1);

    await update({
      hp: { current: effectiveMaxHP, max: maxHP, temp: 0 },
      classes: recoveredClasses,
      hitDiceUsed: recoveredClasses[0]?.hitDiceUsed || 0,
      spellSlots: restoredSpellSlots,
      exhaustion: newExhaustion,
      deathSaves: { successes: 0, failures: 0 },
      ...pactMagicUpdate,
    });
  };

  return {
    // HP State
    currentHP,
    tempHP,
    maxHP,
    hpBonus,
    effectiveMaxHP,
    amount,
    setAmount,
    // Short rest state
    showShortRestDialog,
    shortRestDiceType,
    shortRestDiceCount,
    setShortRestDiceType,
    setShortRestDiceCount,
    selectedTypeRemaining,
    // Computed
    classes,
    hitDiceGroups,
    hasMultipleClasses,
    // HP Handlers
    handleCurrentHPChange,
    handleTempHPChange,
    handleHeal,
    handleDamage,
    handleMaxHPChange,
    handleHPBonusChange,
    // Death saves
    handleDeathSaveSuccessChange,
    handleDeathSaveFailureChange,
    // Hit dice
    handleHitDiceUsedChange,
    // Rests
    toggleShortRestDialog,
    handleShortRest,
    handleLongRest,
  };
}
