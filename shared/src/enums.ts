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

// Action types for filtering (D&D Beyond style)
export type ActionType = 'action' | 'bonus' | 'reaction' | 'free' | 'other';

export const ACTION_TYPE_NAMES: Record<ActionType, string> = {
  action: 'Action',
  bonus: 'Bonus',
  reaction: 'Reaction',
  free: 'Free',
  other: 'Other',
};

// Simplified spell entry attack types
export type SpellAttackType = 'none' | 'attack' | 'save';

// Magic item rarity (D&D 2024 SRD 5.2.1)
export type MagicItemRarity = 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';

// Feature types for knowledge base and compendium
export type FeatureType = 'class' | 'race' | 'feat' | 'other';
