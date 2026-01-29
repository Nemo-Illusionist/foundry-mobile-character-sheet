// ==================== GAME SYSTEMS ====================

// Supported game systems (extensible)
export type GameSystem = 'dnd';

// Game system display names
export const GAME_SYSTEM_NAMES: Record<GameSystem, string> = {
  dnd: 'D&D',
};

// Default game system for backwards compatibility
export const DEFAULT_GAME_SYSTEM: GameSystem = 'dnd';

// ==================== GAME SUBSYSTEMS ====================

export type DnDSubsystem = '2024' | '2014';
export type GameSubsystem = DnDSubsystem;

export const GAME_SUBSYSTEM_NAMES: Record<GameSubsystem, string> = {
  '2024': '2024',
  '2014': '2014',
};

export const DEFAULT_GAME_SUBSYSTEM: GameSubsystem = '2024';

// ==================== ENTITY TYPES ====================

export type EntityType = 'character' | 'mob';

export const ENTITY_TYPE_NAMES: Record<EntityType, string> = {
  character: 'Character',
  mob: 'Mob',
};

export const DEFAULT_ENTITY_TYPE: EntityType = 'character';

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

// ==================== SHEET TYPE UTILITIES ====================

export function buildSheetType(entityType: EntityType, subsystem: GameSubsystem): SheetType {
  return `${entityType}-${subsystem}` as SheetType;
}

export function parseSheetType(sheetType: SheetType): { entityType: EntityType; subsystem: GameSubsystem } {
  const parts = sheetType.split('-');
  return { entityType: parts[0] as EntityType, subsystem: parts[1] as GameSubsystem };
}
