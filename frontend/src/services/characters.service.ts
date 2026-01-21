// Characters Service - CRUD operations for characters with split public/private data
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  serverTimestamp,
  onSnapshot,
  Unsubscribe,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  Character,
  AbilityName,
  SkillName,
  PublicCharacter,
  PrivateCharacterSheet,
  SheetType,
} from 'shared';
import { PUBLIC_CHARACTER_FIELDS } from 'shared';

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
 * Check if a field is public
 */
function isPublicField(field: string): boolean {
  return (PUBLIC_CHARACTER_FIELDS as readonly string[]).includes(field);
}

/**
 * Split character data into public and private parts
 */
function splitCharacterData(
  data: Partial<Character>
): { publicData: Partial<PublicCharacter>; privateData: Partial<PrivateCharacterSheet> } {
  const publicData: Record<string, unknown> = {};
  const privateData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (isPublicField(key)) {
      publicData[key] = value;
    } else {
      privateData[key] = value;
    }
  }

  return {
    publicData: publicData as Partial<PublicCharacter>,
    privateData: privateData as Partial<PrivateCharacterSheet>,
  };
}

/**
 * Create default character data
 */
function createDefaultCharacterData(
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

  // Determine character type based on sheet type
  const isMob = sheetType.startsWith('mob-');
  const characterType = isMob ? 'Minion' : 'Player Character';

  // Public data (stored in characters/{id})
  const publicData: Omit<PublicCharacter, 'createdAt' | 'updatedAt'> = {
    id: '', // Will be set after generating the document ID
    gameId,
    ownerId,
    name,
    sheetType,
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

/**
 * Create a new character with split public/private data (atomic batch write)
 * Public data: /games/{gameId}/characters/{id}
 * Private data: /games/{gameId}/characters/{id}/private/sheet
 */
export async function createCharacter(
  gameId: string,
  ownerId: string,
  name: string,
  sheetType: SheetType = 'character-2024',
  isHidden: boolean = false
): Promise<string> {
  const { publicData, privateData } = createDefaultCharacterData(gameId, ownerId, name, sheetType, isHidden);

  // Generate a new document reference to get a unique ID
  const characterRef = doc(collection(db, 'games', gameId, 'characters'));
  const characterId = characterRef.id;

  // Private data reference (subcollection)
  const privateSheetRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  // Use batch to write both documents atomically
  const batch = writeBatch(db);

  // Public character document
  batch.set(characterRef, {
    ...publicData,
    id: characterId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Private character sheet document
  batch.set(privateSheetRef, privateData);

  await batch.commit();

  return characterId;
}

/**
 * Get a character by ID (merges public + private data)
 */
export async function getCharacter(
  gameId: string,
  characterId: string
): Promise<Character | null> {
  // Load both documents in parallel
  const [publicDoc, privateDoc] = await Promise.all([
    getDoc(doc(db, 'games', gameId, 'characters', characterId)),
    getDoc(doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet')),
  ]);

  if (!publicDoc.exists()) return null;

  const publicData = publicDoc.data() as PublicCharacter;
  const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

  // Merge public and private data
  if (privateData) {
    return { ...publicData, ...privateData } as Character;
  }

  // Return only public data if private doesn't exist (shouldn't happen normally)
  return publicData as unknown as Character;
}

/**
 * Get all characters in a game (full data - for GM or owner)
 */
export async function getGameCharacters(gameId: string): Promise<Character[]> {
  const charactersSnapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  // Load all characters with their private data in parallel
  const characterPromises = charactersSnapshot.docs.map(async (charDoc) => {
    const publicData = charDoc.data() as PublicCharacter;
    const privateDoc = await getDoc(
      doc(db, 'games', gameId, 'characters', charDoc.id, 'private', 'sheet')
    );
    const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

    if (privateData) {
      return { ...publicData, ...privateData } as Character;
    }
    return publicData as unknown as Character;
  });

  const characters = await Promise.all(characterPromises);

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

  // Load private data for each character
  const characterPromises = snapshot.docs.map(async (charDoc) => {
    const publicData = charDoc.data() as PublicCharacter;
    const privateDoc = await getDoc(
      doc(db, 'games', gameId, 'characters', charDoc.id, 'private', 'sheet')
    );
    const privateData = privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : null;

    if (privateData) {
      return { ...publicData, ...privateData } as Character;
    }
    return publicData as unknown as Character;
  });

  const characters = await Promise.all(characterPromises);
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}

/**
 * Subscribe to all PUBLIC characters in a game
 * Accessible by all game participants - shows only public info
 */
export function subscribeToPublicCharacters(
  gameId: string,
  callback: (characters: PublicCharacter[]) => void
): Unsubscribe {
  const charactersRef = collection(db, 'games', gameId, 'characters');

  return onSnapshot(
    charactersRef,
    (snapshot) => {
      const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
      characters.sort((a, b) => a.name.localeCompare(b.name));
      callback(characters);
    },
    (error) => {
      console.error('Error subscribing to public characters:', error);
      callback([]);
    }
  );
}

/**
 * Subscribe to all characters in a game (FULL data)
 * For GM: subscribes to all characters with private data
 * For players: subscribes only to their own characters with private data
 */
export function subscribeToGameCharacters(
  gameId: string,
  currentUserId: string,
  isGM: boolean,
  callback: (characters: Character[]) => void
): Unsubscribe {
  // First, subscribe to public characters
  const charactersRef = isGM
    ? collection(db, 'games', gameId, 'characters')
    : query(
        collection(db, 'games', gameId, 'characters'),
        where('ownerId', '==', currentUserId)
      );

  console.log('Setting up characters subscription for game:', gameId, 'isGM:', isGM);

  // Map to store private data subscriptions
  const privateUnsubscribes = new Map<string, Unsubscribe>();
  const charactersData = new Map<string, { public: PublicCharacter; private?: PrivateCharacterSheet }>();

  const emitCharacters = () => {
    const characters: Character[] = [];
    for (const [, data] of charactersData) {
      if (data.private) {
        characters.push({ ...data.public, ...data.private } as Character);
      } else {
        // If no private data yet, still emit with public data
        characters.push(data.public as unknown as Character);
      }
    }
    characters.sort((a, b) => a.name.localeCompare(b.name));
    callback(characters);
  };

  const publicUnsubscribe = onSnapshot(
    charactersRef,
    (snapshot) => {
      console.log('Characters snapshot received:', {
        gameId,
        isGM,
        size: snapshot.size,
        docs: snapshot.docs.map(d => ({ id: d.id, name: d.data().name }))
      });

      // Track current character IDs
      const currentIds = new Set(snapshot.docs.map(d => d.id));

      // Remove subscriptions for deleted characters
      for (const [id, unsub] of privateUnsubscribes) {
        if (!currentIds.has(id)) {
          unsub();
          privateUnsubscribes.delete(id);
          charactersData.delete(id);
        }
      }

      // Update public data and subscribe to private data for new characters
      for (const charDoc of snapshot.docs) {
        const publicData = charDoc.data() as PublicCharacter;
        const charId = charDoc.id;

        // Update public data
        const existing = charactersData.get(charId);
        charactersData.set(charId, {
          public: publicData,
          private: existing?.private,
        });

        // Subscribe to private data if not already subscribed
        if (!privateUnsubscribes.has(charId)) {
          const privateRef = doc(db, 'games', gameId, 'characters', charId, 'private', 'sheet');
          const privateUnsub = onSnapshot(
            privateRef,
            (privateDoc) => {
              const currentData = charactersData.get(charId);
              if (currentData) {
                charactersData.set(charId, {
                  ...currentData,
                  private: privateDoc.exists() ? (privateDoc.data() as PrivateCharacterSheet) : undefined,
                });
                emitCharacters();
              }
            },
            (error) => {
              console.error('Error subscribing to private character data:', charId, error);
            }
          );
          privateUnsubscribes.set(charId, privateUnsub);
        }
      }

      // Emit with current data (private data will update via their own subscriptions)
      emitCharacters();
    },
    (error) => {
      console.error('Error subscribing to characters:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      callback([]);
    }
  );

  // Return cleanup function
  return () => {
    publicUnsubscribe();
    for (const unsub of privateUnsubscribes.values()) {
      unsub();
    }
    privateUnsubscribes.clear();
  };
}

/**
 * Subscribe to a single character (merges public + private data)
 * Waits for both public and private data to load before emitting
 */
export function subscribeToCharacter(
  gameId: string,
  characterId: string,
  callback: (character: Character | null) => void
): Unsubscribe {
  const publicRef = doc(db, 'games', gameId, 'characters', characterId);
  const privateRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  let publicData: PublicCharacter | null = null;
  let privateData: PrivateCharacterSheet | null = null;
  let publicLoaded = false;
  let privateLoaded = false;

  const emitCharacter = () => {
    // Wait for both subscriptions to load at least once
    if (!publicLoaded || !privateLoaded) {
      return;
    }

    if (publicData && privateData) {
      callback({ ...publicData, ...privateData } as Character);
    } else if (publicData) {
      // Character exists but no private data (shouldn't happen normally)
      console.warn('Character has no private data:', characterId);
      callback(null);
    } else {
      callback(null);
    }
  };

  const publicUnsub = onSnapshot(
    publicRef,
    (snapshot) => {
      publicLoaded = true;
      if (snapshot.exists()) {
        publicData = snapshot.data() as PublicCharacter;
      } else {
        publicData = null;
      }
      emitCharacter();
    },
    (error) => {
      console.error('Error subscribing to character:', error);
      publicLoaded = true;
      callback(null);
    }
  );

  const privateUnsub = onSnapshot(
    privateRef,
    (snapshot) => {
      privateLoaded = true;
      if (snapshot.exists()) {
        privateData = snapshot.data() as PrivateCharacterSheet;
      } else {
        privateData = null;
      }
      emitCharacter();
    },
    (error) => {
      console.error('Error subscribing to private character data:', error);
      privateLoaded = true;
      emitCharacter();
    }
  );

  return () => {
    publicUnsub();
    privateUnsub();
  };
}

/**
 * Update character data
 * Automatically splits updates into public and private documents
 */
export async function updateCharacter(
  gameId: string,
  characterId: string,
  updates: Partial<Omit<Character, 'id' | 'gameId' | 'ownerId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const { publicData, privateData } = splitCharacterData(updates);

  const hasPublicUpdates = Object.keys(publicData).length > 0;
  const hasPrivateUpdates = Object.keys(privateData).length > 0;

  const publicRef = doc(db, 'games', gameId, 'characters', characterId);
  const privateRef = doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet');

  if (hasPublicUpdates && hasPrivateUpdates) {
    // Use batch to update both documents atomically
    const batch = writeBatch(db);

    batch.update(publicRef, {
      ...publicData,
      updatedAt: serverTimestamp(),
    });

    batch.update(privateRef, privateData);

    await batch.commit();
  } else if (hasPublicUpdates) {
    await updateDoc(publicRef, {
      ...publicData,
      updatedAt: serverTimestamp(),
    });
  } else if (hasPrivateUpdates) {
    await updateDoc(privateRef, privateData);
    // Also update the updatedAt on the public document
    await updateDoc(publicRef, {
      updatedAt: serverTimestamp(),
    });
  }
}

/**
 * Delete a character (both public and private data)
 */
export async function deleteCharacter(
  gameId: string,
  characterId: string
): Promise<void> {
  const batch = writeBatch(db);

  batch.delete(doc(db, 'games', gameId, 'characters', characterId));
  batch.delete(doc(db, 'games', gameId, 'characters', characterId, 'private', 'sheet'));

  await batch.commit();
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

// ==================== DEPRECATED FUNCTIONS ====================
// These functions are kept for backwards compatibility during migration
// They will be removed after migration is complete

/**
 * @deprecated Use subscribeToPublicCharacters instead
 * Get all public characters in a game
 */
export async function getPublicCharacters(gameId: string): Promise<PublicCharacter[]> {
  const snapshot = await getDocs(
    collection(db, 'games', gameId, 'characters')
  );

  const characters = snapshot.docs.map((doc) => doc.data() as PublicCharacter);
  characters.sort((a, b) => a.name.localeCompare(b.name));

  return characters;
}
