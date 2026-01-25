// D&D 2024 Class Constants
// Including multiclass prerequisites per SRD 5.2.1

import type { AbilityName, SpellcasterType } from 'shared';

// Standard D&D 2024 classes with their defaults
export interface ClassDefaults {
  name: string;
  hitDice: string;
  spellcasterType: SpellcasterType;
  spellcastingAbility?: AbilityName;
  primaryAbilities: AbilityName[];  // For multiclass prerequisites
}

export const CLASS_DEFAULTS: Record<string, ClassDefaults> = {
  'Barbarian': {
    name: 'Barbarian',
    hitDice: 'd12',
    spellcasterType: 'none',
    primaryAbilities: ['str'],
  },
  'Bard': {
    name: 'Bard',
    hitDice: 'd8',
    spellcasterType: 'full',
    spellcastingAbility: 'cha',
    primaryAbilities: ['cha'],
  },
  'Cleric': {
    name: 'Cleric',
    hitDice: 'd8',
    spellcasterType: 'full',
    spellcastingAbility: 'wis',
    primaryAbilities: ['wis'],
  },
  'Druid': {
    name: 'Druid',
    hitDice: 'd8',
    spellcasterType: 'full',
    spellcastingAbility: 'wis',
    primaryAbilities: ['wis'],
  },
  'Fighter': {
    name: 'Fighter',
    hitDice: 'd10',
    spellcasterType: 'none',  // Base fighter; Eldritch Knight is 'third'
    primaryAbilities: ['str'],  // Or DEX - player's choice
  },
  'Monk': {
    name: 'Monk',
    hitDice: 'd8',
    spellcasterType: 'none',
    primaryAbilities: ['dex', 'wis'],  // Both required for multiclass
  },
  'Paladin': {
    name: 'Paladin',
    hitDice: 'd10',
    spellcasterType: 'half',
    spellcastingAbility: 'cha',
    primaryAbilities: ['str', 'cha'],  // Both required for multiclass
  },
  'Ranger': {
    name: 'Ranger',
    hitDice: 'd10',
    spellcasterType: 'half',
    spellcastingAbility: 'wis',
    primaryAbilities: ['dex', 'wis'],  // Both required for multiclass
  },
  'Rogue': {
    name: 'Rogue',
    hitDice: 'd8',
    spellcasterType: 'none',  // Base rogue; Arcane Trickster is 'third'
    primaryAbilities: ['dex'],
  },
  'Sorcerer': {
    name: 'Sorcerer',
    hitDice: 'd6',
    spellcasterType: 'full',
    spellcastingAbility: 'cha',
    primaryAbilities: ['cha'],
  },
  'Warlock': {
    name: 'Warlock',
    hitDice: 'd8',
    spellcasterType: 'warlock',
    spellcastingAbility: 'cha',
    primaryAbilities: ['cha'],
  },
  'Wizard': {
    name: 'Wizard',
    hitDice: 'd6',
    spellcasterType: 'full',
    spellcastingAbility: 'int',
    primaryAbilities: ['int'],
  },
};

// List of standard class names for dropdowns
export const STANDARD_CLASS_NAMES = Object.keys(CLASS_DEFAULTS);

// Multiclass prerequisites - ability scores must be >= 13
// Per D&D 2024 SRD 5.2.1:
// - To multiclass INTO a new class, you need that class's prerequisites
// - To multiclass OUT OF your current class, you need your current class's prerequisites
export const MULTICLASS_PREREQUISITES: Record<string, AbilityName[]> = {
  'Barbarian': ['str'],
  'Bard': ['cha'],
  'Cleric': ['wis'],
  'Druid': ['wis'],
  'Fighter': ['str'],  // STR 13 OR DEX 13 - we check this specially
  'Monk': ['dex', 'wis'],  // Both needed
  'Paladin': ['str', 'cha'],  // Both needed
  'Ranger': ['dex', 'wis'],  // Both needed
  'Rogue': ['dex'],
  'Sorcerer': ['cha'],
  'Warlock': ['cha'],
  'Wizard': ['int'],
};

// Classes where either STR or DEX satisfies the prerequisite
export const FLEXIBLE_PREREQ_CLASSES = ['Fighter'];

// Minimum ability score for multiclassing
export const MULTICLASS_MIN_SCORE = 13;

/**
 * Check if character meets prerequisites to multiclass INTO a given class
 * @param abilities Character's ability scores
 * @param className Class to multiclass into
 * @returns Object with result and any failing abilities
 */
export function checkMulticlassPrerequisites(
  abilities: Record<AbilityName, number>,
  className: string
): { canMulticlass: boolean; failingAbilities: AbilityName[]; message?: string } {
  const prereqs = MULTICLASS_PREREQUISITES[className];

  // Unknown class - allow custom classes
  if (!prereqs) {
    return { canMulticlass: true, failingAbilities: [] };
  }

  // Special handling for Fighter (STR OR DEX)
  if (FLEXIBLE_PREREQ_CLASSES.includes(className)) {
    const strOk = abilities.str >= MULTICLASS_MIN_SCORE;
    const dexOk = abilities.dex >= MULTICLASS_MIN_SCORE;
    if (strOk || dexOk) {
      return { canMulticlass: true, failingAbilities: [] };
    }
    return {
      canMulticlass: false,
      failingAbilities: ['str', 'dex'],
      message: `${className} requires STR 13 or DEX 13`,
    };
  }

  // Standard check - all listed abilities must be >= 13
  const failingAbilities: AbilityName[] = [];
  for (const ability of prereqs) {
    if (abilities[ability] < MULTICLASS_MIN_SCORE) {
      failingAbilities.push(ability);
    }
  }

  if (failingAbilities.length > 0) {
    const abilityNames = failingAbilities.map(a => a.toUpperCase()).join(', ');
    return {
      canMulticlass: false,
      failingAbilities,
      message: `${className} requires ${abilityNames} 13+`,
    };
  }

  return { canMulticlass: true, failingAbilities: [] };
}

/**
 * Check if character can multiclass OUT of all their current classes
 * (Character must meet prerequisites of all classes they have)
 */
export function checkAllClassPrerequisites(
  abilities: Record<AbilityName, number>,
  classNames: string[]
): { canMulticlass: boolean; issues: { className: string; message: string }[] } {
  const issues: { className: string; message: string }[] = [];

  for (const className of classNames) {
    const result = checkMulticlassPrerequisites(abilities, className);
    if (!result.canMulticlass && result.message) {
      issues.push({ className, message: result.message });
    }
  }

  return {
    canMulticlass: issues.length === 0,
    issues,
  };
}

/**
 * Get default class configuration for a standard class
 */
export function getClassDefaults(className: string): ClassDefaults | null {
  return CLASS_DEFAULTS[className] || null;
}

// Hit dice types for dropdown
export const HIT_DICE_OPTIONS = ['d6', 'd8', 'd10', 'd12'] as const;
export type HitDiceType = typeof HIT_DICE_OPTIONS[number];
