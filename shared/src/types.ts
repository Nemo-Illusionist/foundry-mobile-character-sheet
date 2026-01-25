// OmnisGM - Universal Game Master Tool
// Supporting multiple game systems
// Created from scratch for standalone app

// Timestamp type (compatible with Firebase Timestamp)
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}

// ==================== GAME SYSTEMS ====================

// Supported game systems (extensible)
export type GameSystem = 'dnd';

// Game system display names
export const GAME_SYSTEM_NAMES: Record<GameSystem, string> = {
  dnd: 'D&D',
};

// Default game system for backwards compatibility
export const DEFAULT_GAME_SYSTEM: GameSystem = 'dnd';

// ==================== SHEET TYPES ====================

// D&D specific sheet types
export type DnDSheetType = 'character-2024' | 'character-2014' | 'mob-2024' | 'mob-2014';

// All sheet types (union of all system-specific types)
export type SheetType = DnDSheetType;

// Sheet type display names
export const SHEET_TYPE_NAMES: Record<SheetType, string> = {
  'character-2024': 'Character 2024',
  'character-2014': 'Character 2014',
  'mob-2024': 'Mob 2024',
  'mob-2014': 'Mob 2014',
};

// Short names for cards/badges
export const SHEET_TYPE_SHORT_NAMES: Record<SheetType, string> = {
  'character-2024': '2024',
  'character-2014': '2014',
  'mob-2024': 'Mob 2024',
  'mob-2014': 'Mob 2014',
};

// Sheet types available for each game system
export const SYSTEM_SHEET_TYPES: Record<GameSystem, SheetType[]> = {
  dnd: ['character-2024', 'character-2014', 'mob-2024', 'mob-2014'],
};

// Default sheet type for backwards compatibility
export const DEFAULT_SHEET_TYPE: SheetType = 'character-2024';

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

// Spellcaster types for auto spell slot calculation
// 'third' = 1/3 caster (Eldritch Knight, Arcane Trickster)
export type SpellcasterType = 'none' | 'full' | 'half' | 'third' | 'warlock' | 'manual';

export type MagicSchool =
  | 'Abjuration' | 'Conjuration' | 'Divination' | 'Enchantment'
  | 'Evocation' | 'Illusion' | 'Necromancy' | 'Transmutation';

export type CreatureSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';

export type GameItemType = 'Map' | 'Note' | 'Image';

// D&D 2024 SRD Conditions
export type ConditionName =
  | 'Blinded'
  | 'Charmed'
  | 'Deafened'
  | 'Frightened'
  | 'Grappled'
  | 'Incapacitated'
  | 'Invisible'
  | 'Paralyzed'
  | 'Petrified'
  | 'Poisoned'
  | 'Prone'
  | 'Restrained'
  | 'Stunned'
  | 'Unconscious';

// ==================== USER ====================

export interface User {
  uid: string;                  // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
}

// ==================== GAME ====================

export interface Game {
  id: string;
  name: string;
  description?: string;
  gmId: string;                 // Owner/Game Master UID
  playerIds: string[];          // Список UIDs игроков
  system?: GameSystem;          // Game system (default: 'dnd' for backwards compatibility)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ==================== PUBLIC CHARACTER ====================
// Публичная часть листа персонажа, доступная всем участникам игры
// Хранится в /games/{gameId}/characters/{charId}

export interface PublicCharacter {
  id: string;
  gameId: string;
  ownerId: string;
  name: string;
  avatar?: string;
  sheetType: SheetType;
  publicDescription?: string;  // Публичное описание/внешность
  isHidden?: boolean;          // Скрыт ли персонаж от других игроков
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

// Публичные поля персонажа (для разделения данных)
export const PUBLIC_CHARACTER_FIELDS = [
  'id', 'gameId', 'ownerId', 'name', 'avatar', 'sheetType',
  'publicDescription', 'isHidden', 'createdAt', 'updatedAt'
] as const;

// ==================== CHARACTER CLASS ====================
// Class configuration for multiclassing support

export interface CharacterClass {
  name: string;                       // Class name (Fighter, Wizard, etc.)
  subclass?: string;                  // Subclass (Champion, Evocation, etc.)
  level: number;                      // Class level
  hitDice: string;                    // Hit dice type (d6, d8, d10, d12) - required
  hitDiceUsed?: number;               // Hit dice used (recovered on long rest)
  spellcasterType?: SpellcasterType;  // Caster type for this class
  spellcastingAbility?: AbilityName;  // Spellcasting ability for this class
}

// ==================== PRIVATE CHARACTER SHEET ====================
// Приватная часть листа персонажа (только owner + GM)
// Хранится в /games/{gameId}/characters/{charId}/private/sheet

export interface PrivateCharacterSheet {
  type: CharacterType;          // Персонаж или миньон

  // D&D 5e core stats
  level: number;
  experience?: number;          // XP points
  race: string;                 // Species (legacy field name)
  class: string;                // @deprecated Use classes[0].name
  subclass?: string;            // @deprecated Use classes[0].subclass
  background?: string;

  // Multiclass support
  classes?: CharacterClass[];   // Array of classes (for multiclassing)

  // Abilities (характеристики)
  abilities: {
    [K in AbilityName]: number; // значение от 1 до 30
  };

  // Attributes (атрибуты)
  hp: { current: number; max: number; temp: number };
  hpBonus?: number;             // Bonus to max HP (from items, effects, etc.)
  hitDice?: string;             // @deprecated Use classes[0].hitDice
  hitDiceTotal?: number;        // Total hit dice (= sum of class levels)
  hitDiceUsed?: number;         // @deprecated Use classes[0].hitDiceUsed
  deathSaves?: {
    successes: number;          // 0-3 successful death saves
    failures: number;           // 0-3 failed death saves
  };
  ac: number;                    // Base armor class (without shield)
  shield?: number;               // Shield bonus to AC
  speed: number;
  initiative: number;
  initiativeOverride?: number;   // Custom initiative (overrides dex modifier if set)
  proficiencyBonus: number;
  inspiration?: boolean;       // Inspiration status
  exhaustion?: number;          // Exhaustion level (0-6)
  conditions?: ConditionName[]; // Active conditions (from SRD)

  // Actions (атаки и действия)
  actions?: CharacterAction[];

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
  inventoryItems?: InventoryItem[];  // Simplified inventory items

  // Spells (заклинания)
  spells: CharacterSpell[];
  spellEntries?: CharacterSpellEntry[];  // Simplified spell entries
  spellcastingAbility?: AbilityName;     // @deprecated Use classes[0].spellcastingAbility
  spellcasterType?: SpellcasterType;     // @deprecated Use classes[0].spellcasterType
  showAllSpellLevels?: boolean;          // Show spell levels even without slots
  hideSpellsTab?: boolean;               // Hide spells tab in UI

  // Spell Slots (ячейки заклинаний)
  spellSlots: {
    [key: string]: { current: number; max: number }; // '1', '2', ..., '9'
  };

  // Pact Magic Slots (Warlock's separate spell slot pool - short rest recovery)
  pactMagicSlots?: {
    current: number;   // Current available slots
    max: number;       // Maximum slots
    level: number;     // Slot level (all warlock slots are same level)
  };

  // Currency (валюта)
  currency: {
    [K in Currency]: number;
  };

  // Equipment Training & Proficiencies
  armorTraining?: {
    light: boolean;
    medium: boolean;
    heavy: boolean;
    shields: boolean;
  };
  weaponProficiencies?: string;   // Free text field
  toolProficiencies?: string;     // Free text field

  // Notes (заметки)
  notes?: string;

  // Biography (D&D SRD 5.2 - Character Details)
  biography?: {
    alignment?: string;
    appearance?: {
      age?: number;
      height?: string;
      weight?: number;
      eyes?: string;
      skin?: string;
      hair?: string;
      description?: string;
    };
    personalityTraits?: string;
    ideals?: string;
    bonds?: string;
    flaws?: string;
    backstory?: string;
    languages?: string;
    alliesAndOrganizations?: string;
  };
}

// ==================== CHARACTER (FULL) ====================
// Полный тип персонажа = публичные + приватные данные

export type Character = PublicCharacter & PrivateCharacterSheet;


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

// Action types for filtering (D&D Beyond style)
export type ActionType = 'action' | 'bonus' | 'reaction' | 'free' | 'other';

export const ACTION_TYPE_NAMES: Record<ActionType, string> = {
  action: 'Action',
  bonus: 'Bonus',
  reaction: 'Reaction',
  free: 'Free',
  other: 'Other',
};

export interface CharacterAction {
  id: string;                   // Unique ID for the action
  name: string;                 // Action name (e.g., "Longsword", "Fireball")
  actionType?: ActionType;      // Type of action for filtering
  ability?: AbilityName;        // Ability used for attack (str, dex, etc.)
  proficient?: boolean;         // Whether proficiency bonus applies
  extraBonus?: number;          // Additional bonus to attack
  damage?: string;              // Damage dice (e.g., "1d8", "2d6")
  damageBonus?: number;         // Bonus to damage
  damageType?: string;          // Damage type (e.g., "Slashing", "Fire")
  notes?: string;               // Additional notes
}

export interface InventoryItem {
  id: string;                   // Unique ID
  name: string;                 // Item name
  type: 'weapon' | 'armor' | 'gear' | 'consumable' | 'treasure' | 'other';
  quantity?: number;            // Amount (optional - undefined for standard items, number for consumables)
  weight?: number;              // Weight in lbs
  equipped?: boolean;           // Is item equipped
  attuned?: boolean;            // Is item attuned (for magic items)
  description?: string;         // Item description/notes
}

// Simplified spell entry for character sheet (D&D Beyond style)
export type SpellAttackType = 'none' | 'attack' | 'save';

export interface CharacterSpellEntry {
  id: string;                   // Unique ID
  name: string;                 // Spell name
  level: number;                // 0-9 (0 = cantrip)
  school?: MagicSchool;         // School of magic
  castingTime?: string;         // "1 action", "1 bonus action", "1 reaction", etc.
  range?: string;               // "Self", "Touch", "30 feet", "60-foot cone", etc.
  components?: string;          // Legacy: "V, S, M (a pinch of dust)"
  componentV?: boolean;         // Verbal component
  componentS?: boolean;         // Somatic component
  componentM?: boolean;         // Material component
  materials?: string;           // Material components description
  duration?: string;            // "Instantaneous", "1 minute", "Concentration, 1 hour"
  attackType?: SpellAttackType; // "none", "attack" (spell attack), "save" (saving throw)
  saveAbility?: AbilityName;    // Which ability for saving throw (if attackType === 'save')
  damage?: string;              // Damage/healing dice (e.g., "2d10", "8d6")
  damageType?: string;          // Damage type (e.g., "fire", "radiant", "healing")
  ritual?: boolean;             // Can be cast as ritual
  concentration?: boolean;      // Requires concentration
  prepared?: boolean;           // Is spell prepared (for prepared casters)
  description?: string;         // Spell description
  source?: string;              // Source book/page (e.g., "PHB 279")
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
