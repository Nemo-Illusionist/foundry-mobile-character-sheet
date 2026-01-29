// Characters Defaults - Default character data for new characters
import type {
  PublicCharacter,
  PrivateCharacterSheet,
  SheetType,
} from 'shared';
import { parseSheetType } from 'shared';

/**
 * Create default character data
 */
export function createDefaultCharacterData(
  gameId: string,
  ownerId: string,
  name: string,
  sheetType: SheetType = 'character-2024',
  isHidden: boolean = false
): { publicData: Omit<PublicCharacter, 'createdAt' | 'updatedAt'>; privateData: PrivateCharacterSheet } {
  const defaultAbilities = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };

  const defaultSkills: PrivateCharacterSheet['skills'] = {
    'Acrobatics': { proficiency: 0 },
    'Animal Handling': { proficiency: 0 },
    'Arcana': { proficiency: 0 },
    'Athletics': { proficiency: 0 },
    'Deception': { proficiency: 0 },
    'History': { proficiency: 0 },
    'Insight': { proficiency: 0 },
    'Intimidation': { proficiency: 0 },
    'Investigation': { proficiency: 0 },
    'Medicine': { proficiency: 0 },
    'Nature': { proficiency: 0 },
    'Perception': { proficiency: 0 },
    'Performance': { proficiency: 0 },
    'Persuasion': { proficiency: 0 },
    'Religion': { proficiency: 0 },
    'Sleight of Hand': { proficiency: 0 },
    'Stealth': { proficiency: 0 },
    'Survival': { proficiency: 0 },
  };

  const defaultSavingThrows: PrivateCharacterSheet['savingThrows'] = {
    str: { proficiency: false },
    dex: { proficiency: false },
    con: { proficiency: false },
    int: { proficiency: false },
    wis: { proficiency: false },
    cha: { proficiency: false },
  };

  const defaultCurrency: PrivateCharacterSheet['currency'] = {
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0,
  };

  // Parse sheetType into subsystem and entityType
  const { entityType, subsystem } = parseSheetType(sheetType);

  // Determine character type based on entity type
  const characterType = entityType === 'mob' ? 'Minion' : 'Player Character';

  // Public data (stored in characters/{id})
  const publicData: Omit<PublicCharacter, 'createdAt' | 'updatedAt'> = {
    id: '', // Will be set after generating the document ID
    gameId,
    ownerId,
    name,
    sheetType,
    subsystem,
    entityType,
    isHidden,
  };

  // Private data (stored in characters/{id}/private/sheet)
  const privateData: PrivateCharacterSheet = {
    type: characterType,
    level: 1,
    race: '',
    class: '',
    subclass: '',
    background: '',
    classes: [{
      name: '',
      level: 1,
      hitDice: 'd8',
      hitDiceUsed: 0,
      spellcasterType: 'none',
    }],
    abilities: defaultAbilities,
    hp: { current: 10, max: 10, temp: 0 },
    ac: 10,
    speed: 30,
    initiative: 0,
    proficiencyBonus: 2,
    skills: defaultSkills,
    savingThrows: defaultSavingThrows,
    inventory: [],
    spells: [],
    spellSlots: {},
    currency: defaultCurrency,
    armorTraining: {
      light: false,
      medium: false,
      heavy: false,
      shields: false,
    },
    weaponProficiencies: '',
    toolProficiencies: '',
    notes: '',
  };

  return { publicData, privateData };
}
