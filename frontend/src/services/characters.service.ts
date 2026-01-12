// Characters Service - CRUD operations for characters
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Character, AbilityName, SkillName } from 'shared';

/**
 * Skill ability mapping (D&D 2024 SRD 5.2)
 */
const SKILL_ABILITIES: Record<SkillName, AbilityName> = {
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

/**
 * Create default character data
 */
function createDefaultCharacter(
  gameId: string,
  ownerId: string,
  name: string
): Omit<Character, 'id' | 'createdAt' | 'updatedAt'> {
  const defaultAbilities = {
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  };

  const defaultSkills: Character['skills'] = {
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

  const defaultSavingThrows: Character['savingThrows'] = {
    str: { proficiency: false },
    dex: { proficiency: false },
    con: { proficiency: false },
    int: { proficiency: false },
    wis: { proficiency: false },
    cha: { proficiency: false },
  };

  const defaultCurrency: Character['currency'] = {
    cp: 0,
    sp: 0,
    ep: 0,
    gp: 0,
    pp: 0,
  };

  return {
    gameId,
    ownerId,
    name,
    type: 'Player Character',
    level: 1,
    race: '',
    class: '',
    subclass: '',
    background: '',
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
    notes: '',
  };
}

/**
 * Create a new character
 */
export async function createCharacter(
  gameId: string,
  ownerId: string,
  name: string
): Promise<string> {
  const characterData = createDefaultCharacter(gameId, ownerId, name);

  const docRef = await addDoc(
    collection(db, 'games', gameId, 'characters'),
    {
      ...characterData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  );

  // Update with ID
  await updateDoc(doc(db, 'games', gameId, 'characters', docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

/**
 * Get a character by ID
 */
export async function getCharacter(
  gameId: string,
  characterId: string
): Promise<Character | null> {
  const charDoc = await getDoc(
    doc(db, 'games', gameId, 'characters', characterId)
  );

  if (!charDoc.exists()) return null;

  return charDoc.data() as Character;
}

/**
 * Get all characters in a game
 */
export async function getGameCharacters(gameId: string): Promise<Character[]> {
  const charactersSnapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  const characters = charactersSnapshot.docs.map((doc) => doc.data() as Character);

  // Sort by name
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Get characters owned by a specific user in a game
 */
export async function getUserCharacters(
  gameId: string,
  userId: string
): Promise<Character[]> {
  const q = query(
    collection(db, 'games', gameId, 'characters'),
    where('ownerId', '==', userId)
  );

  const snapshot = await getDocs(q);
  const characters = snapshot.docs.map((doc) => doc.data() as Character);

  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Subscribe to all characters in a game
 */
export function subscribeToGameCharacters(
  gameId: string,
  callback: (characters: Character[]) => void
): Unsubscribe {
  const charactersRef = collection(db, 'games', gameId, 'characters');

  return onSnapshot(
    charactersRef,
    (snapshot) => {
      const characters = snapshot.docs.map((doc) => doc.data() as Character);
      characters.sort((a, b) => a.name.localeCompare(b.name));
      callback(characters);
    },
    (error) => {
      console.error('Error subscribing to characters:', error);
    }
  );
}

/**
 * Subscribe to a single character
 */
export function subscribeToCharacter(
  gameId: string,
  characterId: string,
  callback: (character: Character | null) => void
): Unsubscribe {
  const charRef = doc(db, 'games', gameId, 'characters', characterId);

  return onSnapshot(
    charRef,
    (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data() as Character);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error('Error subscribing to character:', error);
      callback(null);
    }
  );
}

/**
 * Update character data
 */
export async function updateCharacter(
  gameId: string,
  characterId: string,
  updates: Partial<Omit<Character, 'id' | 'gameId' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  await updateDoc(doc(db, 'games', gameId, 'characters', characterId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete a character
 */
export async function deleteCharacter(
  gameId: string,
  characterId: string
): Promise<void> {
  await deleteDoc(doc(db, 'games', gameId, 'characters', characterId));
}

/**
 * Calculate ability modifier
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculate proficiency bonus by level
 */
export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculate skill modifier
 */
export function getSkillModifier(
  character: Character,
  skill: SkillName
): number {
  const ability = SKILL_ABILITIES[skill];
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const proficiency = character.skills[skill].proficiency;
  const profBonus = character.proficiencyBonus;

  return abilityMod + (proficiency * profBonus);
}

/**
 * Calculate saving throw modifier
 */
export function getSavingThrowModifier(
  character: Character,
  ability: AbilityName
): number {
  const abilityMod = getAbilityModifier(character.abilities[ability]);
  const isProficient = character.savingThrows[ability].proficiency;

  return abilityMod + (isProficient ? character.proficiencyBonus : 0);
}
