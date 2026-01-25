/**
 * Migration Script: Make GM Characters Hidden
 *
 * This script sets isHidden: true for all characters owned by the GM of each game.
 *
 * Usage:
 * 1. Ensure serviceAccountKey.json exists in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/migrate-gm-characters-to-hidden.ts --dry-run
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
  gmId: string;
  name: string;
}

interface CharacterDoc {
  id: string;
  gameId: string;
  ownerId: string;
  name: string;
  isHidden?: boolean;
}

async function migrateGmCharactersToHidden(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Migration: Make GM Characters Hidden');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalUpdated = 0;
  let totalSkipped = 0;

  for (const gameDoc of gamesSnapshot.docs) {
    const game = { id: gameDoc.id, ...gameDoc.data() } as GameDoc;
    console.log(`\nGame: ${game.name} (${game.id})`);
    console.log(`  GM ID: ${game.gmId}`);

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

    // Find GM's characters that are not already hidden
    for (const charDoc of charactersSnapshot.docs) {
      const character = { id: charDoc.id, ...charDoc.data() } as CharacterDoc;

      if (character.ownerId === game.gmId) {
        if (character.isHidden) {
          console.log(`  ⏭ ${character.name} - already hidden`);
          totalSkipped++;
        } else {
          console.log(`  ✏️ ${character.name} - setting isHidden: true`);

          if (!dryRun) {
            await charDoc.ref.update({ isHidden: true });
          }
          totalUpdated++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Updated: ${totalUpdated}`);
  console.log(`  Skipped (already hidden): ${totalSkipped}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nMigration complete!');
  }
}

// Run migration
migrateGmCharactersToHidden()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
