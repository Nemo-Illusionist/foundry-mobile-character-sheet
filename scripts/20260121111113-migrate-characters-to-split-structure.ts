/**
 * Migration Script: Split Character Data into Public/Private
 *
 * This script migrates existing character data from the old flat structure
 * to the new split structure with public and private documents.
 *
 * Old structure:
 * - /games/{gameId}/characters/{charId} - all character data
 * - /games/{gameId}/publicCharacters/{charId} - minimal public data (to be deleted)
 *
 * New structure:
 * - /games/{gameId}/characters/{charId} - public character data
 * - /games/{gameId}/characters/{charId}/private/sheet - private character data
 *
 * Usage:
 * 1. Download service account key from Firebase Console:
 *    - Go to Project Settings > Service Accounts
 *    - Click "Generate new private key"
 *    - Save as serviceAccountKey.json in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/migrate-characters-to-split-structure.ts --dry-run
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
  console.error('\nAlternatively, use --key=<path> to specify a different location');
  process.exit(1);
}

// Load service account key
// eslint-disable-next-line @typescript-eslint/no-var-requires
const serviceAccount = require(keyPath);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

// Public fields that stay in the main document
const PUBLIC_FIELDS = [
  'id',
  'gameId',
  'ownerId',
  'name',
  'avatar',
  'sheetType',
  'publicDescription',
  'isHidden',
  'createdAt',
  'updatedAt',
];

interface MigrationStats {
  gamesProcessed: number;
  charactersProcessed: number;
  charactersMigrated: number;
  charactersSkipped: number;
  publicCharactersDeleted: number;
  errors: string[];
}

async function migrateCharacter(
  gameId: string,
  charDoc: admin.firestore.QueryDocumentSnapshot,
  dryRun: boolean,
  stats: MigrationStats
): Promise<void> {
  const charId = charDoc.id;
  const charData = charDoc.data();

  // Check if this character already has a private subcollection
  const privateDocRef = db.doc(`games/${gameId}/characters/${charId}/private/sheet`);
  const privateDoc = await privateDocRef.get();

  if (privateDoc.exists) {
    console.log(`  [SKIP] Character ${charId} (${charData.name}) - already migrated`);
    stats.charactersSkipped++;
    return;
  }

  // Split data into public and private
  const publicData: Record<string, unknown> = {};
  const privateData: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(charData)) {
    if (PUBLIC_FIELDS.includes(key)) {
      publicData[key] = value;
    } else {
      privateData[key] = value;
    }
  }

  // Add default values for new public fields if they don't exist
  if (!publicData.sheetType) {
    publicData.sheetType = 'character-2024';
  }
  if (publicData.isHidden === undefined) {
    publicData.isHidden = false;
  }

  console.log(`  [MIGRATE] Character ${charId} (${charData.name})`);
  console.log(`    Public fields: ${Object.keys(publicData).join(', ')}`);
  console.log(`    Private fields: ${Object.keys(privateData).length} fields`);

  if (!dryRun) {
    const batch = db.batch();

    // Update the main character document with only public data
    const charRef = db.doc(`games/${gameId}/characters/${charId}`);
    batch.set(charRef, publicData);

    // Create the private document
    batch.set(privateDocRef, privateData);

    await batch.commit();
  }

  stats.charactersMigrated++;
}

async function migrateGame(
  gameDoc: admin.firestore.QueryDocumentSnapshot,
  dryRun: boolean,
  stats: MigrationStats
): Promise<void> {
  const gameId = gameDoc.id;
  const gameData = gameDoc.data();

  console.log(`\nProcessing game: ${gameId} (${gameData.name})`);
  stats.gamesProcessed++;

  // Get all characters in this game
  const charactersSnapshot = await db.collection(`games/${gameId}/characters`).get();

  if (charactersSnapshot.empty) {
    console.log('  No characters found');
    return;
  }

  console.log(`  Found ${charactersSnapshot.size} characters`);

  for (const charDoc of charactersSnapshot.docs) {
    try {
      stats.charactersProcessed++;
      await migrateCharacter(gameId, charDoc, dryRun, stats);
    } catch (error) {
      const errorMsg = `Error migrating character ${charDoc.id}: ${error}`;
      console.error(`  [ERROR] ${errorMsg}`);
      stats.errors.push(errorMsg);
    }
  }

  // Delete old publicCharacters collection
  const publicCharsSnapshot = await db.collection(`games/${gameId}/publicCharacters`).get();

  if (!publicCharsSnapshot.empty) {
    console.log(`  Deleting ${publicCharsSnapshot.size} old publicCharacters documents`);

    if (!dryRun) {
      const batch = db.batch();
      for (const doc of publicCharsSnapshot.docs) {
        batch.delete(doc.ref);
        stats.publicCharactersDeleted++;
      }
      await batch.commit();
    } else {
      stats.publicCharactersDeleted += publicCharsSnapshot.size;
    }
  }
}

async function runMigration(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('='.repeat(60));
  console.log('Character Data Migration: Flat -> Split Structure');
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\n*** DRY RUN MODE - No changes will be made ***\n');
  }

  const stats: MigrationStats = {
    gamesProcessed: 0,
    charactersProcessed: 0,
    charactersMigrated: 0,
    charactersSkipped: 0,
    publicCharactersDeleted: 0,
    errors: [],
  };

  try {
    // Get all games
    const gamesSnapshot = await db.collection('games').get();

    if (gamesSnapshot.empty) {
      console.log('No games found in database');
      return;
    }

    console.log(`Found ${gamesSnapshot.size} games to process`);

    for (const gameDoc of gamesSnapshot.docs) {
      await migrateGame(gameDoc, dryRun, stats);
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary');
    console.log('='.repeat(60));
    console.log(`Games processed: ${stats.gamesProcessed}`);
    console.log(`Characters processed: ${stats.charactersProcessed}`);
    console.log(`Characters migrated: ${stats.charactersMigrated}`);
    console.log(`Characters skipped (already migrated): ${stats.charactersSkipped}`);
    console.log(`Old publicCharacters deleted: ${stats.publicCharactersDeleted}`);

    if (stats.errors.length > 0) {
      console.log(`\nErrors encountered: ${stats.errors.length}`);
      stats.errors.forEach((err, i) => console.log(`  ${i + 1}. ${err}`));
    }

    if (dryRun) {
      console.log('\n*** DRY RUN COMPLETE - No changes were made ***');
      console.log('Run without --dry-run flag to apply changes');
    } else {
      console.log('\n*** MIGRATION COMPLETE ***');
    }
  } catch (error) {
    console.error('Fatal error during migration:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
