# План: Новое D&D приложение на Firebase (с нуля)

## Цель
Создать автономное D&D приложение для управления персонажами и играми, **полностью независимое от FoundryVTT**.

---

## 1. Удаление старого кода

### Удалить полностью:
```bash
rm -rf backend/
rm -rf foundry-module/
rm -rf .github/  # GitHub Actions для FoundryVTT модуля
```

### Очистить frontend:
```bash
# Удалить все компоненты
rm -rf frontend/src/components/
rm -rf frontend/src/pages/
rm -rf frontend/src/socket/

# Удалить store (создадим новый для Firebase)
rm -rf frontend/src/store/

# Оставить:
# - frontend/src/App.tsx (очистим и перепишем)
# - frontend/src/App.css (сохраним дизайн-систему)
# - frontend/index.html
# - frontend/vite.config.ts
# - frontend/package.json (обновим зависимости)
```

### Переписать shared/types:
```bash
# Создадим новую структуру типов под Firebase
# Удалим все FoundryVTT-специфичные типы
```

---

## 2. Новая структура проекта

```
mobile-character-sheet/
├── frontend/                 # React PWA приложение
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx          # Авторизация/регистрация
│   │   │   ├── GamesPage.tsx         # Список игр
│   │   │   ├── GamePage.tsx          # Внутри игры (разделы)
│   │   │   ├── CharactersPage.tsx    # Список персонажей
│   │   │   ├── CharacterSheetPage.tsx # Лист персонажа
│   │   │   ├── KnowledgeBasePage.tsx  # База знаний
│   │   │   └── GameItemsPage.tsx      # Общие айтемы игры
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   └── RegisterForm.tsx
│   │   │   ├── games/
│   │   │   │   ├── GameCard.tsx
│   │   │   │   ├── CreateGameModal.tsx
│   │   │   │   └── PlayersList.tsx
│   │   │   ├── characters/
│   │   │   │   ├── CharacterCard.tsx
│   │   │   │   ├── CreateCharacterModal.tsx
│   │   │   │   └── CharacterSheet/
│   │   │   │       ├── StatsSection.tsx
│   │   │   │       ├── InventorySection.tsx
│   │   │   │       └── SpellsSection.tsx
│   │   │   ├── knowledge/
│   │   │   │   ├── SpellsList.tsx
│   │   │   │   ├── ItemsList.tsx
│   │   │   │   ├── ClassesList.tsx
│   │   │   │   └── CreateSpellModal.tsx
│   │   │   ├── gameItems/
│   │   │   │   ├── GameItemCard.tsx
│   │   │   │   └── CreateGameItemModal.tsx
│   │   │   └── shared/
│   │   │       ├── Button.tsx
│   │   │       ├── Card.tsx
│   │   │       ├── Modal.tsx
│   │   │       ├── Input.tsx
│   │   │       └── LoadingSpinner.tsx
│   │   ├── services/
│   │   │   ├── firebase.ts           # Firebase config
│   │   │   ├── auth.service.ts       # Firebase Auth
│   │   │   ├── games.service.ts      # CRUD для игр
│   │   │   ├── characters.service.ts # CRUD для персонажей
│   │   │   ├── knowledge.service.ts  # CRUD для базы знаний
│   │   │   └── gameItems.service.ts  # CRUD для общих айтемов игры
│   │   ├── hooks/
│   │   │   ├── useAuth.ts            # Хук для авторизации
│   │   │   ├── useGames.ts           # Хук для списка игр
│   │   │   ├── useCharacters.ts      # Хук для персонажей
│   │   │   ├── useKnowledge.ts       # Хук для базы знаний
│   │   │   └── useGameItems.ts       # Хук для общих айтемов игры
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # Контекст пользователя
│   │   │   └── GameContext.tsx       # Контекст текущей игры
│   │   ├── types/                    # Frontend-специфичные типы
│   │   │   └── ui.types.ts
│   │   ├── utils/
│   │   │   ├── validators.ts         # Валидация форм
│   │   │   └── formatters.ts         # Форматирование данных
│   │   ├── App.tsx
│   │   ├── App.css                   # Дизайн-система (сохраняем)
│   │   └── main.tsx
│   ├── public/
│   │   ├── manifest.json             # PWA манифест
│   │   └── icons/                    # Иконки для PWA
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── shared/                   # Общие типы
│   └── src/
│       └── types.ts          # Новые типы для Firebase
│
├── firebase/                 # Firebase конфигурация
│   ├── firestore.rules       # Правила безопасности Firestore
│   ├── firestore.indexes.json # Индексы Firestore
│   └── firebase.json         # Firebase config
│
├── package.json              # Root package.json (workspaces)
└── README.md
```

---

## 3. Новые типы данных (shared/src/types.ts)

### User (Firebase Auth + Firestore)
```typescript
interface User {
  uid: string;                // Firebase Auth UID
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Timestamp;
  personalGameId: string;     // ID дефолтной личной игры
}
```

### Game
```typescript
interface Game {
  id: string;
  name: string;
  description?: string;
  gmId: string;               // Owner/Game Master
  playerIds: string[];        // Список игроков
  createdAt: Timestamp;
  updatedAt: Timestamp;
  isPersonal: boolean;        // true для личной игры пользователя
}
```

### Character
```typescript
interface Character {
  id: string;
  gameId: string;
  ownerId: string;            // Player who owns this character
  name: string;
  avatar?: string;
  type: 'character' | 'minion'; // Персонаж или миньон

  // D&D 5e core stats
  level: number;
  race: string;               // Может быть ID из базы знаний или custom
  class: string;
  subclass?: string;
  background?: string;

  // Abilities
  abilities: {
    str: number;
    dex: number;
    con: number;
    int: number;
    wis: number;
    cha: number;
  };

  // Attributes
  hp: { current: number; max: number; temp: number };
  ac: number;
  speed: number;
  initiative: number;

  // Skills (proficiency: 0 = none, 1 = proficient, 2 = expert)
  skills: {
    [key in SkillName]: { proficiency: 0 | 1 | 2 };
  };

  // Saves
  savingThrows: {
    [key in AbilityName]: { proficiency: boolean };
  };

  // Items (references to KnowledgeBase OR custom items)
  inventory: CharacterItem[];

  // Spells (references to KnowledgeBase OR custom spells)
  spells: CharacterSpell[];

  // Resources
  spellSlots: {
    [key: string]: { current: number; max: number }; // '1', '2', etc.
  };

  // Notes
  notes?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### KnowledgeBase (База знаний)

**Spell**
```typescript
interface Spell {
  id: string;
  gameId: string;             // Принадлежит игре
  createdBy: string;          // User ID
  isGMOnly: boolean;          // Виден только GM

  name: string;
  level: number;              // 0-9 (0 = cantrip)
  school: string;             // 'evocation', 'abjuration', etc.
  castingTime: string;
  range: string;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    materialDescription?: string;
  };
  duration: string;
  description: string;
  higherLevels?: string;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Item**
```typescript
interface Item {
  id: string;
  gameId: string;
  createdBy: string;
  isGMOnly: boolean;

  name: string;
  type: 'weapon' | 'armor' | 'equipment' | 'consumable' | 'loot';
  description: string;
  weight?: number;
  value?: { amount: number; currency: 'gp' | 'sp' | 'cp' | 'ep' | 'pp' };

  // Weapon-specific
  damage?: string;            // '1d8'
  damageType?: string;        // 'slashing', 'piercing', etc.
  properties?: string[];      // 'finesse', 'versatile', etc.

  // Armor-specific
  ac?: number;
  armorType?: 'light' | 'medium' | 'heavy' | 'shield';

  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Race, Class, Subclass, Feature** (аналогично Item, с соответствующими полями)

### CharacterItem / CharacterSpell
```typescript
interface CharacterItem {
  sourceId?: string;          // ID из базы знаний (если есть)
  customData?: Item;          // Если айтем только в листе персонажа
  quantity: number;
  equipped: boolean;
  attuned?: boolean;
}

interface CharacterSpell {
  sourceId?: string;          // ID из базы знаний
  customData?: Spell;         // Если заклинание только в листе
  prepared: boolean;
}
```

### GameItem (общие айтемы в игре)
```typescript
interface GameItem {
  id: string;
  gameId: string;
  name: string;
  type: 'map' | 'note' | 'image';
  imageUrl?: string;
  description?: string;
  visibleTo: 'all' | 'gm';
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 4. Firebase структура Firestore

```
/users/{userId}
  - uid, email, displayName, photoURL, createdAt, personalGameId

/games/{gameId}
  - name, description, gmId, playerIds[], isPersonal, createdAt, updatedAt

/games/{gameId}/characters/{characterId}
  - Character data (см. выше)

/games/{gameId}/knowledge/spells/{spellId}
  - Spell data

/games/{gameId}/knowledge/items/{itemId}
  - Item data

/games/{gameId}/knowledge/races/{raceId}
  - Race data

/games/{gameId}/knowledge/classes/{classId}
  - Class data

/games/{gameId}/knowledge/features/{featureId}
  - Feature data

/games/{gameId}/gameItems/{itemId}
  - GameItem data (карты, записки)
```

---

## 5. Firebase Security Rules (firestore.rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
    }

    // Games
    match /games/{gameId} {
      // Readable by GM and players
      allow read: if request.auth != null && (
        resource.data.gmId == request.auth.uid ||
        request.auth.uid in resource.data.playerIds
      );

      // Creatable by any authenticated user
      allow create: if request.auth != null &&
        request.resource.data.gmId == request.auth.uid;

      // Updatable only by GM
      allow update: if request.auth != null &&
        resource.data.gmId == request.auth.uid;

      // Characters subcollection
      match /characters/{characterId} {
        // GM видит всё, игроки видят только своих персонажей
        allow read: if request.auth != null && (
          get(/databases/$(database)/documents/games/$(gameId)).data.gmId == request.auth.uid ||
          resource.data.ownerId == request.auth.uid
        );

        // Создавать и изменять могут только владельцы
        allow create, update: if request.auth != null &&
          request.resource.data.ownerId == request.auth.uid;
      }

      // Knowledge base (база знаний)
      match /knowledge/{type}/{itemId} {
        // Читать могут все игроки игры
        // GM-only айтемы фильтруются на клиенте
        allow read: if request.auth != null && (
          get(/databases/$(database)/documents/games/$(gameId)).data.gmId == request.auth.uid ||
          request.auth.uid in get(/databases/$(database)/documents/games/$(gameId)).data.playerIds
        );

        // Создавать и изменять могут все игроки
        allow create, update: if request.auth != null && (
          get(/databases/$(database)/documents/games/$(gameId)).data.gmId == request.auth.uid ||
          request.auth.uid in get(/databases/$(database)/documents/games/$(gameId)).data.playerIds
        );
      }

      // Game items
      match /gameItems/{itemId} {
        allow read: if request.auth != null && (
          get(/databases/$(database)/documents/games/$(gameId)).data.gmId == request.auth.uid ||
          request.auth.uid in get(/databases/$(database)/documents/games/$(gameId)).data.playerIds
        );

        allow create, update: if request.auth != null;
      }
    }
  }
}
```

---

## 6. Архитектура приложения

### Навигация (React Router)
```
/auth              → AuthPage (логин/регистрация)
/games             → GamesPage (список игр)
/games/:gameId     → GamePage (внутри игры - меню разделов)
  ├── players      → Список игроков
  ├── knowledge    → База знаний
  ├── characters   → Список персонажей
  ├── character/:charId → Лист персонажа
  └── items        → Общие айтемы (просмотр для всех, управление для GM)
```

### State Management
Используем **React Context + hooks** (без Zustand/Redux):
- `AuthContext` - текущий пользователь (Firebase Auth)
- `GameContext` - текущая игра
- Custom hooks с Firebase realtime listeners

### Realtime синхронизация
Firestore `onSnapshot()` для автоматического обновления:
- Список персонажей
- Данные персонажа (когда открыт лист)
- База знаний
- Список игроков
- Общие айтемы игры

---

## 7. Дизайн-система (сохраняем из App.css)

### Цвета (CSS переменные)
```css
:root {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2a2a2a;
  --bg-tertiary: #3a3a3a;
  --text-primary: #ffffff;
  --text-secondary: #b0b0b0;
  --accent: #7c3aed;          /* Фиолетовый */
  --success: #16a34a;
  --warning: #eab308;
  --danger: #dc2626;
}
```

### Компоненты
- Кнопки (primary, secondary, danger)
- Карточки с тенями
- Модальные окна
- Формы ввода
- Загрузчики

**Стиль**: темная тема, gaming aesthetic, мобильно-оптимизированный

---

## 8. Пошаговый план реализации

### Phase 1: Очистка и setup (1-2 часа)
1. ✅ Удалить backend/, foundry-module/, .github/
2. ✅ Очистить frontend/src/
3. ✅ Переписать shared/src/types.ts (новые типы)
4. ✅ Обновить frontend/package.json (добавить firebase)
5. ✅ Создать firebase/ с rules и config
6. ✅ Setup Firebase проект (создать в консоли Firebase)

### Phase 2: Базовая структура (2-3 часа)
1. ✅ Создать services/firebase.ts (инициализация)
2. ✅ Создать AuthContext + useAuth hook
3. ✅ Создать AuthPage (логин/регистрация)
4. ✅ Настроить React Router
5. ✅ Создать базовые shared компоненты (Button, Card, Input, Modal)

### Phase 3: Игры (2-3 часа)
1. ✅ Создать GamesPage (список игр)
2. ✅ Создать GameContext
3. ✅ CRUD для игр (services/games.service.ts)
4. ✅ CreateGameModal
5. ✅ Автоматическое создание личной игры при регистрации

### Phase 4: Персонажи (3-4 часа)
1. ✅ CharactersPage (список персонажей)
2. ✅ CreateCharacterModal
3. ✅ CharacterSheetPage (базовая структура)
4. ✅ CRUD для персонажей (services/characters.service.ts)
5. ✅ Секции листа персонажа:
   - StatsSection (abilities, skills, saves)
   - InventorySection
   - SpellsSection

### Phase 5: База знаний (2-3 часа)
1. ✅ KnowledgeBasePage (табы: Spells, Items, Races, Classes)
2. ✅ CRUD для базы знаний (services/knowledge.service.ts)
3. ✅ Модальные окна создания (CreateSpellModal, CreateItemModal, etc.)
4. ✅ Списки с фильтрацией (GM-only фильтр)

### Phase 6: Интеграция персонажей и базы знаний (2 часа)
1. ✅ Добавление заклинаний/айтемов из базы в лист персонажа
2. ✅ Создание custom айтемов прямо в листе
3. ✅ Синхронизация изменений базы знаний с листами персонажей

### Phase 7: Управление игрой
1. ✅ Список игроков (PlayersList) - просмотр участников игры
2. ✅ Общие айтемы игры (GameItemsPage) - отдельный таб:
   - Карты, записки, изображения
   - Доступны всем игрокам для просмотра
   - GM может добавлять/удалять/редактировать
   - CRUD для GameItems (services/gameItems.service.ts)

### Phase 8: Polish и тестирование (1-2 часа)
1. ✅ Проверка security rules
2. ✅ Тестирование на мобильных
3. ✅ PWA setup (иконки, manifest)
4. ✅ Loading states, error handling
5. ✅ Responsive design проверка

---

## 9. Зависимости (package.json обновления)

### Frontend
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.1",

    "firebase": "^10.7.1",

    // UI utilities
    "clsx": "^2.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.10",
    "vite-plugin-pwa": "^0.17.4",
    "typescript": "^5.3.3"
  }
}
```

### Shared (без изменений)
```json
{
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

---

## 10. Тестирование

### Локальное тестирование
1. **Firebase Emulator Suite** (для разработки без реальной БД):
   ```bash
   firebase emulators:start
   ```

2. **Frontend dev server**:
   ```bash
   cd frontend
   npm run dev
   ```

### Тестовые сценарии
1. ✅ Регистрация нового пользователя
   - Проверить создание личной игры
2. ✅ Создание новой игры
3. ✅ Создание персонажа
4. ✅ Добавление заклинания в базу знаний
5. ✅ Добавление заклинания из базы в лист персонажа
6. ✅ Создание custom айтема в листе (не в базе)
7. ✅ Изменение заклинания в базе → проверить обновление в листе
8. ✅ GM-only айтем не виден обычному игроку
9. ✅ Приглашение игрока в игру
10. ✅ PWA установка на мобильный

### Проверка Security Rules
1. ✅ Игрок не может видеть персонажей других игроков
2. ✅ Игрок не может изменять чужих персонажей
3. ✅ GM видит всех персонажей
4. ✅ Только GM может приглашать игроков
5. ✅ Игрок не может изменять личную игру другого пользователя

---

## 11. Критические файлы для создания

### Новые файлы
- `shared/src/types.ts` (новые типы)
- `firebase/firestore.rules`
- `firebase/firebase.json`
- `frontend/src/services/firebase.ts`
- `frontend/src/services/auth.service.ts`
- `frontend/src/services/games.service.ts`
- `frontend/src/services/characters.service.ts`
- `frontend/src/services/knowledge.service.ts`
- `frontend/src/services/gameItems.service.ts`
- `frontend/src/context/AuthContext.tsx`
- `frontend/src/context/GameContext.tsx`
- `frontend/src/hooks/useAuth.ts`
- `frontend/src/pages/AuthPage.tsx`
- `frontend/src/pages/GamesPage.tsx`
- `frontend/src/pages/GamePage.tsx`
- `frontend/src/pages/CharactersPage.tsx`
- `frontend/src/pages/CharacterSheetPage.tsx`
- `frontend/src/pages/KnowledgeBasePage.tsx`
- `frontend/src/pages/GameItemsPage.tsx`

### Сохранить из текущего проекта
- `frontend/src/App.css` (дизайн-система)
- `frontend/public/manifest.json` (PWA)
- `frontend/vite.config.ts` (PWA config)

---

## 12. Firebase Setup (команды)

```bash
# Установить Firebase CLI
npm install -g firebase-tools

# Войти в Firebase
firebase login

# Инициализировать проект
firebase init

# Выбрать:
# - Firestore
# - Hosting (для PWA)
# - Emulators (для локальной разработки)

# Запустить эмуляторы
firebase emulators:start

# Deploy (когда готово)
firebase deploy
```

---

## Готово к реализации! 🚀

Этот план полностью перестраивает проект:
- ❌ Удаляем FoundryVTT зависимость
- ❌ Удаляем Node.js backend
- ✅ Создаём автономное D&D приложение
- ✅ Firebase backend (auth + Firestore)
- ✅ React PWA frontend
- ✅ Сохраняем дизайн-систему
- ✅ Новая архитектура с нуля
