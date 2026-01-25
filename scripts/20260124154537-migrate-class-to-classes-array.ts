/**
 * Migration Script: Convert flat class fields to classes array
 *
 * This script migrates character data from flat class fields to the new
 * classes array structure for multiclassing support.
 *
 * Migrates:
 * - class -> classes[0].name
 * - subclass -> classes[0].subclass
 * - level -> classes[0].level
 * - hitDice -> classes[0].hitDice
 * - hitDiceUsed -> classes[0].hitDiceUsed
 * - spellcasterType -> classes[0].spellcasterType
 * - spellcastingAbility -> classes[0].spellcastingAbility
 *
 * Also handles:
 * - Warlock Pact Magic slots setup (pactMagicSlots)
 *
 * Usage:
 * 1. Ensure serviceAccountKey.json exists in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/migrate-class-to-classes-array.ts --dry-run
 * 3. Review output, then run without --dry-run to apply changes
 *
 * Options:
 * --dry-run  Only show what would be migrated without making changes
 * --key=<path>  Path to service account key file (default: ./serviceAccountKey.json)
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const keyArg = args.find(arg => arg.startsWith('--key='));
const keyPath = keyArg
  ? keyArg.split('=')[1]
  : path.join(process.cwd(), 'serviceAccountKey.json');

// Check if service account key exists
if (!fs.existsSync(keyPath)) {
  console.error(`Error: Service account key not found at: ${keyPath}`);
  console.error('\nTo get your service account key:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save the file as serviceAccountKey.json in your project root');
  process.exit(1);
}

// Load service account key
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

interface GameDoc {
  id: string;
  name: string;
}

interface CharacterClass {
  name: string;
  subclass?: string;
  level: number;
  hitDice?: string;
  hitDiceUsed?: number;
  spellcasterType?: string;
  spellcastingAbility?: string;
}

interface PrivateSheetDoc {
  class?: string;
  subclass?: string;
  level?: number;
  hitDice?: string;
  hitDiceUsed?: number;
  spellcasterType?: string;
  spellcastingAbility?: string;
  classes?: CharacterClass[];
  pactMagicSlots?: { current: number; max: number; level: number };
}

// Warlock Pact Magic table (D&D 2024 SRD 5.2.1)
const WARLOCK_PACT_MAGIC: Record<number, { slots: number; level: number }> = {
  1:  { slots: 1, level: 1 },
  2:  { slots: 2, level: 1 },
  3:  { slots: 2, level: 2 },
  4:  { slots: 2, level: 2 },
  5:  { slots: 2, level: 3 },
  6:  { slots: 2, level: 3 },
  7:  { slots: 2, level: 4 },
  8:  { slots: 2, level: 4 },
  9:  { slots: 2, level: 5 },
  10: { slots: 2, level: 5 },
  11: { slots: 3, level: 5 },
  12: { slots: 3, level: 5 },
  13: { slots: 3, level: 5 },
  14: { slots: 3, level: 5 },
  15: { slots: 3, level: 5 },
  16: { slots: 3, level: 5 },
  17: { slots: 4, level: 5 },
  18: { slots: 4, level: 5 },
  19: { slots: 4, level: 5 },
  20: { slots: 4, level: 5 },
};

function getWarlockPactMagic(warlockLevel: number): { slots: number; level: number } | null {
  if (warlockLevel < 1 || warlockLevel > 20) return null;
  return WARLOCK_PACT_MAGIC[warlockLevel] || null;
}

async function migrateClassToClassesArray(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Migration: Convert class fields to classes array');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalNoClass = 0;

  for (const gameDoc of gamesSnapshot.docs) {
    const game = { id: gameDoc.id, ...gameDoc.data() } as GameDoc;
    console.log(`\nGame: ${game.name} (${game.id})`);

    // Get all characters in this game
    const charactersSnapshot = await db
      .collection('games')
      .doc(game.id)
      .collection('characters')
      .get();

    if (charactersSnapshot.empty) {
      console.log('  No characters found');
      continue;
    }

    for (const charDoc of charactersSnapshot.docs) {
      const charData = charDoc.data();
      const charName = charData.name || 'Unknown';

      // Get private sheet
      const privateSheetRef = db
        .collection('games')
        .doc(game.id)
        .collection('characters')
        .doc(charDoc.id)
        .collection('private')
        .doc('sheet');

      const privateSheetDoc = await privateSheetRef.get();

      if (!privateSheetDoc.exists) {
        console.log(`  ⏭ ${charName} - no private sheet`);
        totalSkipped++;
        continue;
      }

      const sheet = privateSheetDoc.data() as PrivateSheetDoc;

      // Skip if already has classes array
      if (sheet.classes && sheet.classes.length > 0) {
        console.log(`  ⏭ ${charName} - already has classes array`);
        totalSkipped++;
        continue;
      }

      // Skip if no class data
      if (!sheet.class && !sheet.level) {
        console.log(`  ⏭ ${charName} - no class data`);
        totalNoClass++;
        continue;
      }

      // Build the new class object
      const newClass: CharacterClass = {
        name: sheet.class || '',
        level: sheet.level || 1,
      };

      if (sheet.subclass) {
        newClass.subclass = sheet.subclass;
      }
      if (sheet.hitDice) {
        newClass.hitDice = sheet.hitDice;
      }
      if (sheet.hitDiceUsed !== undefined) {
        newClass.hitDiceUsed = sheet.hitDiceUsed;
      }
      if (sheet.spellcasterType && sheet.spellcasterType !== 'none') {
        newClass.spellcasterType = sheet.spellcasterType;
      }
      if (sheet.spellcastingAbility) {
        newClass.spellcastingAbility = sheet.spellcastingAbility;
      }

      console.log(`  ✏️ ${charName} - migrating to classes array`);
      console.log(`     Class: ${newClass.name || '(empty)'}, Level: ${newClass.level}`);
      if (newClass.subclass) console.log(`     Subclass: ${newClass.subclass}`);
      if (newClass.hitDice) console.log(`     Hit Dice: ${newClass.hitDice}`);
      if (newClass.spellcasterType) console.log(`     Caster Type: ${newClass.spellcasterType}`);
      if (newClass.spellcastingAbility) console.log(`     Casting Ability: ${newClass.spellcastingAbility}`);

      // Build update object
      const updateData: Record<string, unknown> = {
        classes: [newClass],
      };

      // Add Pact Magic for Warlocks
      if (newClass.spellcasterType === 'warlock' && !sheet.pactMagicSlots) {
        const pactMagic = getWarlockPactMagic(newClass.level);
        if (pactMagic) {
          updateData.pactMagicSlots = {
            current: pactMagic.slots,
            max: pactMagic.slots,
            level: pactMagic.level,
          };
          console.log(`     Pact Magic: ${pactMagic.slots} slots at level ${pactMagic.level}`);
        }
      }

      if (!dryRun) {
        await privateSheetRef.update(updateData);
      }
      totalMigrated++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Migrated: ${totalMigrated}`);
  console.log(`  Skipped (already migrated): ${totalSkipped}`);
  console.log(`  Skipped (no class data): ${totalNoClass}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nMigration complete!');
  }
}

// Run migration
migrateClassToClassesArray()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
