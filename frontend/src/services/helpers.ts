// Helper functions for the application

/**
 * Get personal game ID for a user
 * Personal game ID is deterministic: personal_{userId}
 */
export function getPersonalGameId(userId: string): string {
  return `personal_${userId}`;
}

/**
 * Check if a game ID is a personal game
 */
export function isPersonalGameId(gameId: string): boolean {
  return gameId.startsWith('personal_');
}

/**
 * Extract user ID from personal game ID
 */
export function getUserIdFromPersonalGameId(gameId: string): string | null {
  if (!isPersonalGameId(gameId)) return null;
  return gameId.replace('personal_', '');
}
