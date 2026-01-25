// D&D 2024 Spell Slots by Caster Type and Level
// Including multiclass support per SRD 5.2.1

// Re-export SpellcasterType from shared for convenience
import type { SpellcasterType, CharacterClass } from 'shared';
export type { SpellcasterType } from 'shared';

export interface SpellSlotConfig {
  [level: number]: { max: number }; // level 1-9
}

// Full Caster (Wizard, Cleric, Druid, Sorcerer, Bard)
export const FULL_CASTER_SLOTS: Record<number, SpellSlotConfig> = {
  1:  { 1: { max: 2 } },
  2:  { 1: { max: 3 } },
  3:  { 1: { max: 4 }, 2: { max: 2 } },
  4:  { 1: { max: 4 }, 2: { max: 3 } },
  5:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  6:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  7:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  8:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  9:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  10: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
  11: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 } },
  12: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 } },
  13: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 } },
  14: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 } },
  15: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 } },
  16: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 } },
  17: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  18: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 1 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  19: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 2 }, 7: { max: 1 }, 8: { max: 1 }, 9: { max: 1 } },
  20: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 3 }, 6: { max: 2 }, 7: { max: 2 }, 8: { max: 1 }, 9: { max: 1 } },
};

// Half Caster (Paladin, Ranger, Artificer)
export const HALF_CASTER_SLOTS: Record<number, SpellSlotConfig> = {
  1:  {},
  2:  { 1: { max: 2 } },
  3:  { 1: { max: 3 } },
  4:  { 1: { max: 3 } },
  5:  { 1: { max: 4 }, 2: { max: 2 } },
  6:  { 1: { max: 4 }, 2: { max: 2 } },
  7:  { 1: { max: 4 }, 2: { max: 3 } },
  8:  { 1: { max: 4 }, 2: { max: 3 } },
  9:  { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  10: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  11: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  12: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  13: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  14: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  15: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  16: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 2 } },
  17: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  18: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 1 } },
  19: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
  20: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 3 }, 5: { max: 2 } },
};

// Third Caster (Eldritch Knight, Arcane Trickster) - gains slots at 1/3 rate
export const THIRD_CASTER_SLOTS: Record<number, SpellSlotConfig> = {
  1:  {},
  2:  {},
  3:  { 1: { max: 2 } },
  4:  { 1: { max: 3 } },
  5:  { 1: { max: 3 } },
  6:  { 1: { max: 3 } },
  7:  { 1: { max: 4 }, 2: { max: 2 } },
  8:  { 1: { max: 4 }, 2: { max: 2 } },
  9:  { 1: { max: 4 }, 2: { max: 2 } },
  10: { 1: { max: 4 }, 2: { max: 3 } },
  11: { 1: { max: 4 }, 2: { max: 3 } },
  12: { 1: { max: 4 }, 2: { max: 3 } },
  13: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  14: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  15: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 2 } },
  16: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  17: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  18: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 } },
  19: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
  20: { 1: { max: 4 }, 2: { max: 3 }, 3: { max: 3 }, 4: { max: 1 } },
};

// Warlock Pact Magic - stored separately, short rest recovery
// Returns: { slots: number of slots, level: slot level }
export const WARLOCK_PACT_MAGIC: Record<number, { slots: number; level: number }> = {
  1:  { slots: 1, level: 1 },
  2:  { slots: 2, level: 1 },
  3:  { slots: 2, level: 2 },
  4:  { slots: 2, level: 2 },
  5:  { slots: 2, level: 3 },
  6:  { slots: 2, level: 3 },
  7:  { slots: 2, level: 4 },
  8:  { slots: 2, level: 4 },
  9:  { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};

// Legacy Warlock slots (for single-class display - converts to regular slot format)
export const WARLOCK_SLOTS: Record<number, SpellSlotConfig> = {
  1:  { 1: { max: 1 } },
  2:  { 1: { max: 2 } },
  3:  { 2: { max: 2 } },
  4:  { 2: { max: 2 } },
  5:  { 3: { max: 2 } },
  6:  { 3: { max: 2 } },
  7:  { 4: { max: 2 } },
  8:  { 4: { max: 2 } },
  9:  { 5: { max: 2 } },
  10: { 5: { max: 2 } },
  11: { 5: { max: 3 } },
  12: { 5: { max: 3 } },
  13: { 5: { max: 3 } },
  14: { 5: { max: 3 } },
  15: { 5: { max: 3 } },
  16: { 5: { max: 3 } },
  17: { 5: { max: 4 } },
  18: { 5: { max: 4 } },
  19: { 5: { max: 4 } },
  20: { 5: { max: 4 } },
};

// Multiclass Spell Slots Table (D&D 2024 SRD 5.2.1)
// Used when character has multiple spellcasting classes
// Key is "effective caster level" (see calculateEffectiveCasterLevel)
export const MULTICLASS_SPELL_SLOTS: Record<number, Record<number, number>> = {
  1:  { 1: 2 },
  2:  { 1: 3 },
  3:  { 1: 4, 2: 2 },
  4:  { 1: 4, 2: 3 },
  5:  { 1: 4, 2: 3, 3: 2 },
  6:  { 1: 4, 2: 3, 3: 3 },
  7:  { 1: 4, 2: 3, 3: 3, 4: 1 },
  8:  { 1: 4, 2: 3, 3: 3, 4: 2 },
  9:  { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
  10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
  11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
  13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
  15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
  17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
  18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
  19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
  20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 },
};

/**
 * Calculate effective caster level for multiclass spell slots
 * Per D&D 2024 SRD 5.2.1:
 * - Full caster levels count as 1
 * - Half caster levels count as 1/2 (rounded up)
 * - Third caster levels count as 1/3 (rounded down)
 * - Warlock levels do NOT count (Pact Magic is separate)
 */
export function calculateEffectiveCasterLevel(classes: CharacterClass[]): number {
  let level = 0;
  for (const cls of classes) {
    switch (cls.spellcasterType) {
      case 'full':
        level += cls.level;
        break;
      case 'half':
        level += Math.ceil(cls.level / 2);
        break;
      case 'third':
        level += Math.floor(cls.level / 3);
        break;
      // 'warlock', 'none', 'manual' don't contribute to multiclass caster level
    }
  }
  return Math.min(20, level);
}

/**
 * Get Warlock class from classes array
 */
export function getWarlockClass(classes: CharacterClass[]): CharacterClass | null {
  return classes.find(c => c.spellcasterType === 'warlock') || null;
}

/**
 * Check if character has multiple spellcasting classes (requires multiclass calculation)
 */
export function isMulticlassCaster(classes: CharacterClass[]): boolean {
  const casterClasses = classes.filter(c =>
    c.spellcasterType === 'full' ||
    c.spellcasterType === 'half' ||
    c.spellcasterType === 'third'
  );
  return casterClasses.length > 1;
}

/**
 * Calculate spell slots for multiclass characters
 * Returns slots in the format { [level]: max }
 */
export function calculateMulticlassSpellSlots(classes: CharacterClass[]): Record<number, number> {
  const effectiveLevel = calculateEffectiveCasterLevel(classes);
  if (effectiveLevel === 0) return {};
  return MULTICLASS_SPELL_SLOTS[effectiveLevel] || {};
}

/**
 * Get Pact Magic slots for Warlock
 */
export function getWarlockPactMagic(warlockLevel: number): { slots: number; level: number } | null {
  if (warlockLevel < 1 || warlockLevel > 20) return null;
  return WARLOCK_PACT_MAGIC[warlockLevel] || null;
}

// Get spell slots for a given caster type and level (single class)
export function getSpellSlotsForLevel(
  casterType: SpellcasterType,
  level: number
): Record<number, { current: number; max: number }> {
  let config: SpellSlotConfig = {};

  switch (casterType) {
    case 'full':
      config = FULL_CASTER_SLOTS[level] || {};
      break;
    case 'half':
      config = HALF_CASTER_SLOTS[level] || {};
      break;
    case 'third':
      config = THIRD_CASTER_SLOTS[level] || {};
      break;
    case 'warlock':
      config = WARLOCK_SLOTS[level] || {};
      break;
    case 'none':
    default:
      config = {};
  }

  // Convert to full slot format with current = max (full slots)
  const result: Record<number, { current: number; max: number }> = {};
  for (let i = 1; i <= 9; i++) {
    const slotConfig = config[i];
    result[i] = { current: slotConfig?.max || 0, max: slotConfig?.max || 0 };
  }
  return result;
}

/**
 * Get spell slots for character (handles both single and multiclass)
 */
export function getSpellSlotsForCharacter(
  classes: CharacterClass[]
): Record<number, { current: number; max: number }> {
  // Filter to only spellcasting classes (excluding warlock which uses pact magic)
  const casterClasses = classes.filter(c =>
    c.spellcasterType === 'full' ||
    c.spellcasterType === 'half' ||
    c.spellcasterType === 'third'
  );

  if (casterClasses.length === 0) {
    // No regular casters, return empty slots
    const result: Record<number, { current: number; max: number }> = {};
    for (let i = 1; i <= 9; i++) {
      result[i] = { current: 0, max: 0 };
    }
    return result;
  }

  if (casterClasses.length === 1) {
    // Single caster - use class-specific table
    const cls = casterClasses[0];
    return getSpellSlotsForLevel(cls.spellcasterType || 'none', cls.level);
  }

  // Multiple casters - use multiclass table
  const multiclassSlots = calculateMulticlassSpellSlots(classes);
  const result: Record<number, { current: number; max: number }> = {};
  for (let i = 1; i <= 9; i++) {
    const max = multiclassSlots[i] || 0;
    result[i] = { current: max, max };
  }
  return result;
}

export const CASTER_TYPE_NAMES: Record<SpellcasterType, string> = {
  none: 'None',
  full: 'Full Caster',
  half: 'Half Caster',
  third: '1/3 Caster',
  warlock: 'Warlock',
  manual: 'Manual',
};
