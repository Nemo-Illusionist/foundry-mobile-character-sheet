// D&D 2024 Character Management - Firebase Types
// Based on D&D 2024 SRD v5.2.1 (System Reference Document)
// Created from scratch for standalone app

// Timestamp type (compatible with Firebase Timestamp)
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

// ==================== ENUMS & CONSTANTS ====================

export type AbilityName = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type SkillName =
  | 'Acrobatics' | 'Animal Handling' | 'Arcana' | 'Athletics'
  | 'Deception' | 'History' | 'Insight' | 'Intimidation'
  | 'Investigation' | 'Medicine' | 'Nature' | 'Perception'
  | 'Performance' | 'Persuasion' | 'Religion' | 'Sleight of Hand'
  | 'Stealth' | 'Survival';

export type CharacterType = 'Player Character' | 'Minion';

export type ItemType = 'Weapon' | 'Armor' | 'Adventuring Gear' | 'Consumable' | 'Treasure';

export type ArmorType = 'Light Armor' | 'Medium Armor' | 'Heavy Armor' | 'Shield';

export type Currency = 'cp' | 'sp' | 'ep' | 'gp' | 'pp';

export type MagicSchool =
  | 'Abjuration' | 'Conjuration' | 'Divination' | 'Enchantment'
  | 'Evocation' | 'Illusion' | 'Necromancy' | 'Transmutation';

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type GameItemType = 'Map' | 'Note' | 'Image';

// ==================== USER ====================

export interface User {
  uid: string;                  // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  // Personal game ID is deterministic: personal_{uid}
  // No need to store it explicitly
}

// ==================== GAME ====================

export interface Game {
  id: string;
  name: string;
  description?: string;
  gmId: string;                 // Owner/Game Master UID
  playerIds: string[];          // Список UIDs игроков
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPersonal: boolean;          // true для личной игры пользователя
}

// ==================== CHARACTER ====================

export interface Character {
  id: string;
  gameId: string;
  ownerId: string;              // Player UID who owns this character
  name: string;
  avatar?: string;              // URL аватара
  type: CharacterType;          // Персонаж или миньон

  // D&D 5e core stats
  level: number;
  experience?: number;          // XP points
  race: string;                 // Может быть ID из базы знаний или custom
  class: string;
  subclass?: string;
  background?: string;

  // Abilities (характеристики)
  abilities: {
    [K in AbilityName]: number; // значение от 1 до 30
  };

  // Attributes (атрибуты)
  hp: { current: number; max: number; temp: number };
  hpBonus?: number;             // Bonus to max HP (from items, effects, etc.)
  hitDice?: string;             // Hit dice (d6, d8, d10, d12)
  ac: number;
  speed: number;
  initiative: number;
  proficiencyBonus: number;
  inspiration?: boolean;       // Inspiration status
  exhaustion?: number;          // Exhaustion level (0-6)

  // Skills (навыки)
  // proficiency: 0 = none, 1 = proficient, 2 = expert
  skills: {
    [K in SkillName]: {
      proficiency: 0 | 1 | 2;
    };
  };

  // Saving Throws (спасброски)
  savingThrows: {
    [K in AbilityName]: {
      proficiency: boolean;
    };
  };

  // Inventory (инвентарь)
  inventory: CharacterItem[];

  // Spells (заклинания)
  spells: CharacterSpell[];

  // Spell Slots (ячейки заклинаний)
  spellSlots: {
    [key: string]: { current: number; max: number }; // '1', '2', ..., '9'
  };

  // Currency (валюта)
  currency: {
    [K in Currency]: number;
  };

  // Notes (заметки)
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== CHARACTER ITEMS & SPELLS ====================

export interface CharacterItem {
  sourceId?: string;            // ID из базы знаний (если есть)
  customData?: Item;            // Если айтем только в листе персонажа
  quantity: number;
  equipped: boolean;
  attuned?: boolean;
}

export interface CharacterSpell {
  sourceId?: string;            // ID из базы знаний
  customData?: Spell;           // Если заклинание только в листе
  prepared: boolean;
}

// ==================== KNOWLEDGE BASE - SPELL ====================

export interface Spell {
  id: string;
  gameId: string;               // Принадлежит игре
  createdBy: string;            // User UID
  isGMOnly: boolean;            // Виден только GM

  name: string;
  level: number;                // 0-9 (0 = cantrip)
  school: MagicSchool;
  castingTime: string;          // "1 action", "1 bonus action", etc.
  range: string;                // "Self", "30 feet", etc.
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  duration: string;             // "Instantaneous", "Concentration, up to 1 minute", etc.
  description: string;
  higherLevels?: string;        // Описание эффекта на более высоких уровнях

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== KNOWLEDGE BASE - ITEM ====================

export interface Item {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  type: ItemType;
  description: string;
  weight?: number;              // В фунтах
  value?: {
    amount: number;
    currency: Currency;
  };

  // Weapon-specific
  damage?: string;              // '1d8', '2d6', etc.
  damageType?: string;          // 'slashing', 'piercing', 'bludgeoning', etc.
  properties?: string[];        // 'finesse', 'versatile', 'two-handed', etc.

  // Armor-specific
  ac?: number;
  armorType?: ArmorType;

  // Magic item
  rarity?: string;              // 'common', 'uncommon', 'rare', etc.
  requiresAttunement?: boolean;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== KNOWLEDGE BASE - RACE ====================

export interface Race {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  description: string;
  size: CreatureSize;           // D&D 2024 SRD v5.2.1
  speed: number;
  languages: string[];
  traits: string[];             // Special abilities/features

  abilityBonuses?: {
    [K in AbilityName]?: number;
  };

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== KNOWLEDGE BASE - CLASS ====================

export interface Class {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  description: string;
  hitDice: string;              // 'd6', 'd8', 'd10', 'd12'
  primaryAbility: AbilityName;
  savingThrows: AbilityName[];
  skillProficiencies: SkillName[];
  features: string[];           // Class features

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== KNOWLEDGE BASE - SUBCLASS ====================

export interface Subclass {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  parentClassId: string;        // ID родительского класса
  description: string;
  features: string[];

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== KNOWLEDGE BASE - FEATURE ====================

export interface Feature {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  type: 'class' | 'race' | 'feat' | 'other';
  description: string;
  requirements?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== GAME ITEMS ====================

export interface GameItem {
  id: string;
  gameId: string;
  name: string;
  type: GameItemType;
  imageUrl?: string;
  description?: string;
  visibleTo: 'all' | 'gm';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== HELPER TYPES ====================

// Ability score modifier calculation helper
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

// Skill ability mapping (D&D 2024 SRD 5.2)
export const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
  'Acrobatics': 'dex',
  'Animal Handling': 'wis',
  'Arcana': 'int',
  'Athletics': 'str',
  'Deception': 'cha',
  'History': 'int',
  'Insight': 'wis',
  'Intimidation': 'cha',
  'Investigation': 'int',
  'Medicine': 'wis',
  'Nature': 'int',
  'Perception': 'wis',
  'Performance': 'cha',
  'Persuasion': 'cha',
  'Religion': 'int',
  'Sleight of Hand': 'dex',
  'Stealth': 'dex',
  'Survival': 'wis',
};

// Default proficiency bonus by level
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}
