/**
 * Migration Script: Add subsystem and entityType fields from sheetType
 *
 * Parses existing sheetType ('character-2024', 'mob-2014', etc.) into separate
 * subsystem ('2024', '2014') and entityType ('character', 'mob') fields
 * on public character documents.
 *
 * Usage:
 * 1. Ensure serviceAccountKey.json exists in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/20260129120000-migrate-sheettype-to-subsystem-entitytype.ts --dry-run
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

type EntityType = 'character' | 'mob';
type GameSubsystem = '2024' | '2014';

function parseSheetType(sheetType: string): { entityType: EntityType; subsystem: GameSubsystem } {
  const parts = sheetType.split('-');
  return { entityType: parts[0] as EntityType, subsystem: parts[1] as GameSubsystem };
}

async function migrateSheetTypeToSubsystemEntityType(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Migration: Add subsystem + entityType from sheetType');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const gameDoc of gamesSnapshot.docs) {
    const gameData = gameDoc.data();
    const gameName = gameData.name || 'Unknown';
    console.log(`\nGame: ${gameName} (${gameDoc.id})`);

    // Get all characters in this game
    const charactersSnapshot = await db
      .collection('games')
      .doc(gameDoc.id)
      .collection('characters')
      .get();

    if (charactersSnapshot.empty) {
      console.log('  No characters found');
      continue;
    }

    for (const charDoc of charactersSnapshot.docs) {
      const charData = charDoc.data();
      const charName = charData.name || 'Unknown';

      // Skip if already has subsystem field
      if (charData.subsystem) {
        console.log(`  ⏭ ${charName} - already has subsystem field`);
        totalSkipped++;
        continue;
      }

      const sheetType = charData.sheetType;
      if (!sheetType) {
        console.log(`  ⚠️ ${charName} - no sheetType field, skipping`);
        totalErrors++;
        continue;
      }

      // Parse sheetType
      try {
        const { entityType, subsystem } = parseSheetType(sheetType);

        console.log(`  ✏️ ${charName} - sheetType: "${sheetType}" → subsystem: "${subsystem}", entityType: "${entityType}"`);

        if (!dryRun) {
          await charDoc.ref.update({
            subsystem,
            entityType,
          });
        }
        totalMigrated++;
      } catch (err) {
        console.log(`  ❌ ${charName} - failed to parse sheetType: "${sheetType}"`);
        totalErrors++;
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Migrated: ${totalMigrated}`);
  console.log(`  Skipped (already migrated): ${totalSkipped}`);
  console.log(`  Errors: ${totalErrors}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nMigration complete!');
  }
}

// Run migration
migrateSheetTypeToSubsystemEntityType()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
