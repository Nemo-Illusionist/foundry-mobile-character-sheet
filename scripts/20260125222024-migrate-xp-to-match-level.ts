/**
 * Migration Script: Set XP to match character level
 *
 * This script ensures that character experience points (XP) correspond to their
 * stored level. This is needed after the level system refactor where:
 * - Global level is now calculated from XP
 * - Class levels are separate from global level
 *
 * Characters with XP lower than their level threshold will have XP updated
 * to the minimum required for their current level.
 *
 * Usage:
 * 1. Ensure serviceAccountKey.json exists in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/migrate-xp-to-match-level.ts --dry-run
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

interface PrivateSheetDoc {
  level?: number;
  experience?: number;
}

// XP thresholds for each level (D&D 2024 SRD 5.2.1)
const XP_THRESHOLDS = [
  0,      // Level 1: 0 XP
  300,    // Level 2
  900,    // Level 3
  2700,   // Level 4
  6500,   // Level 5
  14000,  // Level 6
  23000,  // Level 7
  34000,  // Level 8
  48000,  // Level 9
  64000,  // Level 10
  85000,  // Level 11
  100000, // Level 12
  120000, // Level 13
  140000, // Level 14
  165000, // Level 15
  195000, // Level 16
  225000, // Level 17
  265000, // Level 18
  305000, // Level 19
  355000, // Level 20
];

/**
 * Calculate level from XP
 */
function calculateLevelFromXP(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

/**
 * Get minimum XP required for a level
 */
function getXPForLevel(level: number): number {
  if (level < 1) return 0;
  if (level > 20) return XP_THRESHOLDS[19];
  return XP_THRESHOLDS[level - 1];
}

async function migrateXPToMatchLevel(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Migration: Set XP to match character level');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalAlreadyCorrect = 0;

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
      const currentLevel = sheet.level || 1;
      const currentXP = sheet.experience || 0;
      const levelFromXP = calculateLevelFromXP(currentXP);

      // If XP already corresponds to level or higher, no migration needed
      if (levelFromXP >= currentLevel) {
        console.log(`  ✓ ${charName} - XP OK (${currentXP} XP = Level ${levelFromXP}, stored Level ${currentLevel})`);
        totalAlreadyCorrect++;
        continue;
      }

      // XP is too low for the stored level - need to update
      const correctXP = getXPForLevel(currentLevel);

      console.log(`  ✏️ ${charName} - updating XP`);
      console.log(`     Level: ${currentLevel}`);
      console.log(`     Current XP: ${currentXP} (= Level ${levelFromXP})`);
      console.log(`     New XP: ${correctXP} (minimum for Level ${currentLevel})`);

      if (!dryRun) {
        await privateSheetRef.update({
          experience: correctXP,
        });
      }
      totalMigrated++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Migrated: ${totalMigrated}`);
  console.log(`  Already correct: ${totalAlreadyCorrect}`);
  console.log(`  Skipped (no private sheet): ${totalSkipped}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nMigration complete!');
  }
}

// Run migration
migrateXPToMatchLevel()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
