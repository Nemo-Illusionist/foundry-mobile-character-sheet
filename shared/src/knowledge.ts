import type { Timestamp } from './timestamp';
import type {
  AbilityName,
  SkillName,
  ItemType,
  ArmorType,
  Currency,
  MagicSchool,
  CreatureSize,
  FeatureType,
} from './enums';

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
  type: FeatureType;
  description: string;
  requirements?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
