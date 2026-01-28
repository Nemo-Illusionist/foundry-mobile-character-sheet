// D&D 2024 - Character Utility Functions

import { getAbilityModifier } from '../../core';
import type { Character, CharacterClass, AbilityName } from 'shared';

/**
 * Get primary class from character (supports both old and new structure)
 *
 * For multiclassing support, character data can be stored in two ways:
 * - New: `classes` array with CharacterClass objects
 * - Legacy: flat fields (class, subclass, level, hitDice, etc.)
 *
 * This helper provides backward compatibility by checking for the new
 * structure first, then falling back to legacy fields.
 */
export function getPrimaryClass(character: Character): CharacterClass {
  // Prefer new classes array
  if (character.classes && character.classes.length > 0) {
    return character.classes[0];
  }
  // Fall back to legacy fields
  return {
    name: character.class || '',
    subclass: character.subclass,
    level: character.level,
    hitDice: character.hitDice || 'd8',
    hitDiceUsed: character.hitDiceUsed,
    spellcasterType: character.spellcasterType,
    spellcastingAbility: character.spellcastingAbility,
  };
}

/**
 * Get all classes from character (or single class as array)
 */
export function getClasses(character: Character): CharacterClass[] {
  if (character.classes && character.classes.length > 0) {
    return character.classes;
  }
  // Fall back to legacy - return as single-element array
  return [getPrimaryClass(character)];
}

/**
 * Get total level from all classes
 */
export function getTotalLevel(character: Character): number {
  if (character.classes && character.classes.length > 0) {
    return character.classes.reduce((sum, c) => sum + c.level, 0);
  }
  return character.level;
}

/**
 * Check if character has multiple classes
 */
export function isMulticlass(character: Character): boolean {
  return character.classes !== undefined && character.classes.length > 1;
}

/**
 * Get class by index (returns undefined if not found)
 */
export function getClassByIndex(character: Character, index: number): CharacterClass | undefined {
  if (character.classes && character.classes.length > index) {
    return character.classes[index];
  }
  if (index === 0) {
    return getPrimaryClass(character);
  }
  return undefined;
}

/**
 * Find Warlock class if character has one
 */
export function getWarlockClass(character: Character): CharacterClass | null {
  const classes = getClasses(character);
  return classes.find(c => c.spellcasterType === 'warlock') || null;
}

/**
 * Get all spellcasting classes (excluding 'none' and 'manual')
 */
export function getSpellcastingClasses(character: Character): CharacterClass[] {
  const classes = getClasses(character);
  return classes.filter(c =>
    c.spellcasterType &&
    c.spellcasterType !== 'none' &&
    c.spellcasterType !== 'manual'
  );
}

/**
 * Get unique spellcasting abilities from all classes
 */
export function getSpellcastingAbilities(character: Character): AbilityName[] {
  const classes = getSpellcastingClasses(character);
  const abilities = new Set<AbilityName>();

  for (const cls of classes) {
    if (cls.spellcastingAbility) {
      abilities.add(cls.spellcastingAbility);
    }
  }

  return Array.from(abilities);
}

/**
 * Get hit dice grouped by type for multiclass display
 * Returns: { 'd8': { total: 5, used: 2, className: 'Cleric' }, ... }
 */
export interface HitDiceGroup {
  type: string;
  total: number;
  used: number;
  className: string; // Combined class names for display (e.g., "Fighter, Paladin")
  classes: { name: string; level: number; used: number }[];
}

export function getHitDiceByType(character: Character): HitDiceGroup[] {
  const classes = getClasses(character);
  const groups: Record<string, HitDiceGroup> = {};

  for (const cls of classes) {
    const diceType = cls.hitDice || 'd8';
    if (!groups[diceType]) {
      groups[diceType] = {
        type: diceType,
        total: 0,
        used: 0,
        className: '',
        classes: [],
      };
    }
    groups[diceType].total += cls.level;
    groups[diceType].used += cls.hitDiceUsed || 0;
    groups[diceType].classes.push({
      name: cls.name,
      level: cls.level,
      used: cls.hitDiceUsed || 0,
    });
  }

  // Build className from class names
  for (const group of Object.values(groups)) {
    group.className = group.classes.map(c => c.name).join(', ');
  }

  // Sort by dice size (d12 > d10 > d8 > d6)
  const diceOrder = ['d12', 'd10', 'd8', 'd6'];
  return Object.values(groups).sort((a, b) => {
    return diceOrder.indexOf(a.type) - diceOrder.indexOf(b.type);
  });
}

/**
 * Get total hit dice remaining across all classes
 */
export function getTotalHitDiceRemaining(character: Character): number {
  const classes = getClasses(character);
  let total = 0;
  let used = 0;

  for (const cls of classes) {
    total += cls.level;
    used += cls.hitDiceUsed || 0;
  }

  return total - used;
}

/**
 * Calculate how many hit dice should be recovered on long rest
 * Per D&D 2024: Recover half of total hit dice (minimum 1) of EACH type
 */
export function calculateHitDiceRecovery(character: Character): Record<string, number> {
  const groups = getHitDiceByType(character);
  const recovery: Record<string, number> = {};

  for (const group of groups) {
    // Recover half of hit dice for this type, minimum 1 if any are used
    const maxRecovery = Math.max(1, Math.floor(group.total / 2));
    recovery[group.type] = Math.min(group.used, maxRecovery);
  }

  return recovery;
}

/**
 * Create updated classes array with hit dice changes
 * Distributes used hit dice across classes of the same type
 */
export function updateHitDiceUsed(
  character: Character,
  diceType: string,
  deltaUsed: number
): CharacterClass[] {
  const classes = [...getClasses(character)];

  // Find all classes with this dice type
  const matchingIndices = classes
    .map((c, i) => c.hitDice === diceType ? i : -1)
    .filter(i => i >= 0);

  if (matchingIndices.length === 0) return classes;

  // Calculate current total used for this dice type
  let currentUsed = 0;
  for (const i of matchingIndices) {
    currentUsed += classes[i].hitDiceUsed || 0;
  }

  // Calculate new total used (clamped)
  const totalDice = matchingIndices.reduce((sum, i) => sum + classes[i].level, 0);
  const newTotalUsed = Math.max(0, Math.min(totalDice, currentUsed + deltaUsed));

  // Distribute used dice across classes (fill from first to last)
  let remaining = newTotalUsed;
  for (const i of matchingIndices) {
    const maxForClass = classes[i].level;
    const usedForClass = Math.min(remaining, maxForClass);
    classes[i] = { ...classes[i], hitDiceUsed: usedForClass };
    remaining -= usedForClass;
  }

  return classes;
}

/**
 * Apply long rest hit dice recovery to all classes
 */
export function applyLongRestHitDiceRecovery(character: Character): CharacterClass[] {
  const classes = [...getClasses(character)];
  const recovery = calculateHitDiceRecovery(character);

  // Group classes by dice type
  const byType: Record<string, number[]> = {};
  for (let i = 0; i < classes.length; i++) {
    const type = classes[i].hitDice || 'd8';
    if (!byType[type]) byType[type] = [];
    byType[type].push(i);
  }

  // Apply recovery for each dice type
  for (const [type, indices] of Object.entries(byType)) {
    let toRecover = recovery[type] || 0;

    // Recover from classes in order
    for (const i of indices) {
      if (toRecover <= 0) break;
      const used = classes[i].hitDiceUsed || 0;
      const recover = Math.min(used, toRecover);
      classes[i] = { ...classes[i], hitDiceUsed: used - recover };
      toRecover -= recover;
    }
  }

  return classes;
}

/**
 * Generate a random ID for new entities (items, actions, spells)
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Shorten casting time for table display
 */
export function formatCastingTime(time: string | undefined): string {
  if (!time) return '—';
  const lower = time.toLowerCase();
  if (lower === '1 action') return '1A';
  if (lower === '1 bonus action') return '1BA';
  if (lower === '1 reaction') return '1R';
  if (lower.endsWith(' minute')) return time.replace(' minute', 'm');
  if (lower.endsWith(' minutes')) return time.replace(' minutes', 'm');
  if (lower.endsWith(' hour')) return time.replace(' hour', 'h');
  if (lower.endsWith(' hours')) return time.replace(' hours', 'h');
  return time;
}

/**
 * Calculate spellcasting stats for a given ability
 */
export function calculateSpellStats(character: Character, ability: AbilityName) {
  const abilityScore = character.abilities[ability];
  const spellModifier = getAbilityModifier(abilityScore);
  const spellSaveDC = 8 + character.proficiencyBonus + spellModifier;
  const spellAttackBonus = character.proficiencyBonus + spellModifier;
  return { spellModifier, spellSaveDC, spellAttackBonus };
}

/**
 * Format class display string (e.g., "Fighter 5 / Wizard 3")
 */
export function formatClassDisplay(character: Character): string {
  const classes = getClasses(character);
  if (classes.length === 0) return 'No Class';
  if (classes.length === 1) {
    const cls = classes[0];
    return cls.name ? `${cls.name} ${cls.level}` : 'No Class';
  }
  return classes
    .filter(c => c.name)
    .map(c => `${c.name} ${c.level}`)
    .join(' / ');
}
