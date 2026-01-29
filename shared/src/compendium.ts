import type { Timestamp } from './timestamp';
import type { GameSystem, GameSubsystem } from './game-systems';
import type { MagicSchool, ItemType, MagicItemRarity, FeatureType } from './enums';

// ==================== COMPENDIUM CATEGORIES ====================

export type CompendiumCategory =
  | 'spell' | 'item' | 'magic-item' | 'race' | 'class'
  | 'feature' | 'background' | 'condition' | 'creature';

export const COMPENDIUM_CATEGORIES: CompendiumCategory[] = [
  'spell', 'item', 'magic-item', 'race', 'class',
  'feature', 'background', 'condition', 'creature',
];

export const COMPENDIUM_CATEGORY_NAMES: Record<CompendiumCategory, string> = {
  'spell': 'Spells',
  'item': 'Items',
  'magic-item': 'Magic Items',
  'race': 'Races',
  'class': 'Classes',
  'feature': 'Features',
  'background': 'Backgrounds',
  'condition': 'Conditions',
  'creature': 'Creatures',
};

// ==================== TYPED SUBCATEGORIES ====================

export interface CompendiumSubcategoryMap {
  'spell': MagicSchool;
  'item': ItemType;
  'magic-item': MagicItemRarity;
  'race': null;
  'class': null;
  'feature': FeatureType;
  'background': null;
  'condition': null;
  'creature': null;
}

export type CompendiumSubcategory<C extends CompendiumCategory> = CompendiumSubcategoryMap[C];
export type AnyCompendiumSubcategory = MagicSchool | ItemType | MagicItemRarity | FeatureType | null;

// ==================== COMPENDIUM ITEM ====================

export interface CompendiumItemBase {
  id: string;
  name: string;
  description: string;
  source: string | null;         // Source: "PHB 279", "SRD 5.2.1"
  system: GameSystem;
  subsystem: GameSubsystem | null;
  category: CompendiumCategory;
  subcategory: AnyCompendiumSubcategory;
  data: Record<string, unknown>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CompendiumItem<C extends CompendiumCategory = CompendiumCategory>
  extends CompendiumItemBase {
  category: C;
  subcategory: CompendiumSubcategoryMap[C];
}
