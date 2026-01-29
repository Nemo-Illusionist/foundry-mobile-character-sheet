/**
 * Cleanup Script: Remove unused knowledge subcollection
 *
 * Deletes all documents in /games/{gameId}/knowledge/{type}/{itemId}
 * subcollections across all games. This collection is no longer used
 * and is being replaced by the global /compendium collection.
 *
 * Usage:
 * 1. Ensure serviceAccountKey.json exists in project root
 * 2. Run: npx ts-node --project scripts/tsconfig.json scripts/20260129120001-cleanup-knowledge-collection.ts --dry-run
 * 3. Review output, then run without --dry-run to apply changes
 *
 * Options:
 * --dry-run  Only show what would be deleted without making changes
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

// Known knowledge subcollection types
const KNOWLEDGE_TYPES = ['spells', 'items', 'races', 'classes', 'subclasses', 'features'];

async function cleanupKnowledgeCollection(): Promise<void> {
  console.log('='.repeat(60));
  console.log('Cleanup: Remove unused knowledge subcollections');
  console.log('='.repeat(60));
  console.log(`Mode: ${dryRun ? 'DRY RUN (no changes will be made)' : 'LIVE'}`);
  console.log('');

  // Get all games
  const gamesSnapshot = await db.collection('games').get();
  console.log(`Found ${gamesSnapshot.size} games\n`);

  let totalDeleted = 0;

  for (const gameDoc of gamesSnapshot.docs) {
    const gameData = gameDoc.data();
    const gameName = gameData.name || 'Unknown';
    console.log(`\nGame: ${gameName} (${gameDoc.id})`);

    let gameDeleteCount = 0;

    for (const type of KNOWLEDGE_TYPES) {
      const knowledgeSnapshot = await db
        .collection('games')
        .doc(gameDoc.id)
        .collection('knowledge')
        .doc(type)
        .collection(type)
        .get();

      // Also check if knowledge/{type} has direct documents
      const directSnapshot = await db
        .collection('games')
        .doc(gameDoc.id)
        .collection('knowledge')
        .get();

      if (!knowledgeSnapshot.empty) {
        console.log(`  📁 knowledge/${type}: ${knowledgeSnapshot.size} documents`);

        if (!dryRun) {
          const batch = db.batch();
          let batchCount = 0;
          for (const doc of knowledgeSnapshot.docs) {
            batch.delete(doc.ref);
            batchCount++;
            // Firestore batch limit is 500
            if (batchCount >= 500) {
              await batch.commit();
              batchCount = 0;
            }
          }
          if (batchCount > 0) {
            await batch.commit();
          }
        }

        gameDeleteCount += knowledgeSnapshot.size;
      }

      // Delete the type document itself if it exists
      if (directSnapshot.docs.some(d => d.id === type)) {
        console.log(`  📄 knowledge/${type} (type document)`);
        if (!dryRun) {
          await db
            .collection('games')
            .doc(gameDoc.id)
            .collection('knowledge')
            .doc(type)
            .delete();
        }
        gameDeleteCount++;
      }
    }

    if (gameDeleteCount === 0) {
      console.log('  No knowledge documents found');
    } else {
      console.log(`  Total: ${gameDeleteCount} documents ${dryRun ? 'would be' : ''} deleted`);
    }

    totalDeleted += gameDeleteCount;
  }

  console.log('\n' + '='.repeat(60));
  console.log('Summary:');
  console.log(`  Total documents ${dryRun ? 'to delete' : 'deleted'}: ${totalDeleted}`);
  console.log('='.repeat(60));

  if (dryRun) {
    console.log('\nThis was a DRY RUN. No changes were made.');
    console.log('Run without --dry-run to apply changes.');
  } else {
    console.log('\nCleanup complete!');
  }
}

// Run cleanup
cleanupKnowledgeCollection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Cleanup failed:', error);
    process.exit(1);
  });
