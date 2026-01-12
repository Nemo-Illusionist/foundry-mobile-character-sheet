# Frontend Architecture

## Clean Architecture with Services

This project follows a clean architecture pattern with clear separation of concerns:

```
Components/Pages → Hooks → Services → Firebase
```

### Layer Responsibilities

#### 🎨 **Components & Pages** (`src/components/`, `src/pages/`)
- **Only UI logic**
- No direct Firebase imports
- Use hooks for data access
- Handle user interactions

```tsx
// ✅ Good
import { useGames } from '../hooks/useGames';

function GamesPage() {
  const { games, loading } = useGames();
  // ...
}

// ❌ Bad
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

function GamesPage() {
  const [games, setGames] = useState([]);
  useEffect(() => {
    getDocs(collection(db, 'games')).then(/* ... */);
  }, []);
}
```

#### 🎣 **Hooks** (`src/hooks/`)
- Custom React hooks
- Manage state and subscriptions
- Call services for data operations
- No direct Firebase calls (only through services)

**Available Hooks:**
- `useAuth()` - Current user authentication state
- `useGames()` - Subscribe to user's games
- `useGameById(gameId)` - Subscribe to single game
- `useCharacters(gameId)` - Subscribe to game characters
- `useCharacter(gameId, characterId)` - Subscribe to single character

```tsx
// ✅ Good
export function useGames() {
  const { firebaseUser } = useAuth();
  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    if (!firebaseUser) return;

    const unsubscribe = subscribeToUserGames(firebaseUser.uid, setGames);
    return unsubscribe;
  }, [firebaseUser]);

  return { games, loading, error };
}
```

#### 🔧 **Services** (`src/services/`)
- All Firebase operations
- CRUD functions
- Real-time subscriptions
- Business logic

**Service Structure:**

**`auth.service.ts`** - Authentication
- `register()` - Create user account
- `signIn()` - Login
- `signOut()` - Logout
- `getCurrentUserData()` - Get Firestore user data
- `onAuthChange()` - Subscribe to auth state

**`games.service.ts`** - Games management
- `createGame()` - Create new game
- `getGame()` - Get single game
- `getUserGames()` - Get user's games
- `subscribeToGame()` - Real-time single game subscription
- `subscribeToUserGames()` - Real-time user games subscription
- `updateGame()` - Update game details
- `addPlayerToGame()` - Add player
- `removePlayerFromGame()` - Remove player
- `deleteGame()` - Delete game
- `isGameMaster()` - Check if user is GM
- `isPlayer()` - Check if user is player

**`characters.service.ts`** - Character management
- `createCharacter()` - Create character with defaults
- `getCharacter()` - Get single character
- `getGameCharacters()` - Get all game characters
- `getUserCharacters()` - Get user's characters
- `subscribeToGameCharacters()` - Real-time characters subscription
- `subscribeToCharacter()` - Real-time single character subscription
- `updateCharacter()` - Update character data
- `deleteCharacter()` - Delete character
- Helper functions: `getAbilityModifier()`, `getSkillModifier()`, etc.

**`users.service.ts`** - User management
- `getUser()` - Get user by UID
- `getUserByEmail()` - Find user by email
- `getUsers()` - Get multiple users (batched)

**`firebase.ts`** - Firebase initialization
- Initialize Firebase app
- Connect to emulators in development
- Export `auth`, `db` instances

```tsx
// services/games.service.ts
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export async function createGame(name: string, gmId: string): Promise<string> {
  const docRef = await addDoc(collection(db, 'games'), {
    name,
    gmId,
    playerIds: [gmId],
    createdAt: serverTimestamp(),
    // ...
  });

  return docRef.id;
}
```

### Data Flow Examples

#### Creating a Game
```
User clicks "Create Game"
  ↓
CreateGameModal calls createGame() service
  ↓
Service writes to Firestore
  ↓
Real-time subscription in useGames() receives update
  ↓
GamesPage re-renders with new game
```

#### Real-time Updates
```
User A invites User B to game
  ↓
InvitePlayerModal calls addPlayerToGame() service
  ↓
Service updates game.playerIds in Firestore
  ↓
subscribeToGame() listener fires
  ↓
useGameById() hook updates state
  ↓
GameManagePage re-renders
  ↓
PlayersList shows new player
```

### Benefits of This Architecture

✅ **Separation of Concerns**
- Components focus on UI
- Services handle data logic
- Easy to understand and maintain

✅ **Testability**
- Services can be mocked easily
- Components can be tested in isolation
- Clear contracts between layers

✅ **Reusability**
- Services can be used by multiple components
- Hooks can be shared across features
- No duplication of Firebase logic

✅ **Maintainability**
- One place to change data logic (services)
- Easy to add logging, error handling
- Clear where bugs likely are

✅ **Future Migration**
- Easy to switch to Cloud Functions later
- Just change service implementation
- Components don't need to change

### Rules

1. **Never import Firebase directly in components/pages**
2. **All Firebase operations go through services**
3. **Components only use hooks for data**
4. **Services export pure functions (no React)**
5. **Hooks manage subscriptions lifecycle**

### Example: Adding a New Feature

Want to add "Favorite Games" feature?

1. **Add service function:**
```ts
// services/games.service.ts
export async function toggleFavoriteGame(userId: string, gameId: string): Promise<void> {
  // Firestore logic here
}
```

2. **Create hook (if needed):**
```ts
// hooks/useFavoriteGames.ts
export function useFavoriteGames(userId: string) {
  // Subscribe to favorites
}
```

3. **Use in component:**
```tsx
// components/GameCard.tsx
import { toggleFavoriteGame } from '../services/games.service';

function GameCard({ game }) {
  const handleFavorite = () => toggleFavoriteGame(userId, game.id);
  // ...
}
```

---

This architecture keeps the codebase clean, maintainable, and ready for future changes! 🎯
