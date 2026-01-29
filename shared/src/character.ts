import type { Timestamp } from './timestamp';
import type { SheetType, GameSubsystem, EntityType } from './game-systems';
import type {
  AbilityName,
  SkillName,
  CharacterType,
  Currency,
  SpellcasterType,
  MagicSchool,
  ConditionName,
  ActionType,
  SpellAttackType,
} from './enums';
import type { Spell, Item } from './knowledge';

// ==================== PUBLIC CHARACTER ====================
// Публичная часть листа персонажа, доступная всем участникам игры
// Хранится в /games/{gameId}/characters/{charId}

export interface PublicCharacter {
  id: string;
  gameId: string;
  ownerId: string;
  name: string;
  avatar?: string;
  sheetType: SheetType;          // @deprecated — use subsystem + entityType
  subsystem: GameSubsystem;      // '2024' | '2014'
  entityType: EntityType;        // 'character' | 'mob'
  publicDescription?: string;  // Публичное описание/внешность
  isHidden?: boolean;          // Скрыт ли персонаж от других игроков
  createdAt?: Timestamp;
  updatedAt: Timestamp;
}

// Публичные поля персонажа (для разделения данных)
export const PUBLIC_CHARACTER_FIELDS = [
  'id', 'gameId', 'ownerId', 'name', 'avatar', 'sheetType',
  'subsystem', 'entityType',
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
