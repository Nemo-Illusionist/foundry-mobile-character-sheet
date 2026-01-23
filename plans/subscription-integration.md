# План интеграции подписки (Paddle)

## Обзор

Реализация системы подписки для OmnisGM с ограничением: бесплатные пользователи могут участвовать максимум в 1 игре.

---

## Фаза 1: Структура базы данных

### 1.1 Обновить тип User (shared/types)

```ts
interface UserSubscription {
  active: boolean;
  plan: 'free' | 'pro';
  paddleCustomerId?: string;
  paddleSubscriptionId?: string;
  expiresAt?: Timestamp;
  cancelledAt?: Timestamp;
}

interface User {
  // existing fields...
  subscription: UserSubscription;
  gameIds: string[];  // список игр где участвует
}
```

### 1.2 Миграция существующих пользователей

- Добавить `subscription: { active: false, plan: 'free' }` всем существующим
- Собрать `gameIds` из существующих games где user является GM или player

---

## Фаза 2: Firestore Security Rules

### 2.1 Users collection

```javascript
match /users/{userId} {
  allow read: if isAuthenticated();

  allow create: if isAuthenticated() && isOwner(userId) &&
    // При создании subscription должен быть inactive
    request.resource.data.subscription.active == false;

  allow update: if isAuthenticated() && isOwner(userId) && (
    // Запрет изменения subscription с клиента
    !request.resource.data.diff(resource.data).affectedKeys()
      .hasAny(['subscription'])
  ) && (
    // Лимит игр при изменении gameIds
    request.resource.data.gameIds == resource.data.gameIds ||
    resource.data.subscription.active == true ||
    !('gameIds' in resource.data) ||
    resource.data.gameIds.size() < 1
  );

  allow delete: if false;
}
```

### 2.2 Games collection

```javascript
match /games/{gameId} {
  function getUserGameIds() {
    return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.gameIds;
  }

  function hasGameReserved() {
    return gameId in getUserGameIds();
  }

  // Создание игры
  allow create: if isAuthenticated() &&
    request.resource.data.gmId == request.auth.uid &&
    hasGameReserved();

  // Обновление игры
  allow update: if isAuthenticated() && (
    // GM может всё
    resource.data.gmId == request.auth.uid ||
    // Игрок джойнит себя (должен иметь gameId в своих gameIds)
    (hasGameReserved() &&
     request.auth.uid in request.resource.data.playerIds &&
     !(request.auth.uid in resource.data.playerIds))
  );

  // Удаление - только GM
  allow delete: if isAuthenticated() &&
    resource.data.gmId == request.auth.uid;
}
```

---

## Фаза 3: Cloud Function — Paddle Webhook

### 3.1 Создать Firebase Function

```
functions/
├── src/
│   ├── index.ts
│   └── paddle/
│       ├── webhook.ts
│       └── verifySignature.ts
├── package.json
└── tsconfig.json
```

### 3.2 Webhook handler

```ts
// functions/src/paddle/webhook.ts
import { onRequest } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';

export const paddleWebhook = onRequest(async (req, res) => {
  // 1. Verify Paddle signature
  // 2. Parse event type
  // 3. Update user subscription in Firestore

  const event = req.body;

  switch (event.event_type) {
    case 'subscription.activated':
    case 'subscription.updated':
      await activateSubscription(event.data);
      break;

    case 'subscription.canceled':
    case 'subscription.paused':
      await deactivateSubscription(event.data);
      break;

    case 'subscription.past_due':
      // Grace period - keep active but warn
      break;
  }

  res.status(200).send('OK');
});

async function activateSubscription(data: any) {
  const db = getFirestore();
  const userId = data.custom_data?.userId;

  if (!userId) return;

  await db.doc(`users/${userId}`).update({
    'subscription.active': true,
    'subscription.plan': 'pro',
    'subscription.paddleCustomerId': data.customer_id,
    'subscription.paddleSubscriptionId': data.subscription_id,
    'subscription.expiresAt': new Date(data.current_billing_period.ends_at),
  });
}
```

### 3.3 Secrets

```bash
firebase functions:secrets:set PADDLE_WEBHOOK_SECRET
firebase functions:secrets:set PADDLE_API_KEY
```

---

## Фаза 4: Paddle Client Setup

### 4.1 Установить Paddle.js

```bash
npm install @paddle/paddle-js
```

### 4.2 Инициализация

```ts
// services/paddle.service.ts
import { initializePaddle, Paddle } from '@paddle/paddle-js';

let paddle: Paddle | null = null;

export async function getPaddle() {
  if (!paddle) {
    paddle = await initializePaddle({
      environment: import.meta.env.PROD ? 'production' : 'sandbox',
      token: import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
    });
  }
  return paddle;
}

export async function openCheckout(userId: string, userEmail: string) {
  const paddle = await getPaddle();

  paddle.Checkout.open({
    items: [{ priceId: import.meta.env.VITE_PADDLE_PRICE_ID, quantity: 1 }],
    customer: { email: userEmail },
    customData: { userId },  // Для webhook
  });
}
```

### 4.3 Environment variables

```env
# .env.local
VITE_PADDLE_CLIENT_TOKEN=live_xxx...
VITE_PADDLE_PRICE_ID=pri_xxx...
```

---

## Фаза 5: Frontend — Subscription UI

### 5.1 Subscription Context

```ts
// contexts/SubscriptionContext.tsx
interface SubscriptionContextValue {
  isSubscribed: boolean;
  plan: 'free' | 'pro';
  gameCount: number;
  canCreateGame: boolean;
  canJoinGame: boolean;
  openUpgradeModal: () => void;
}
```

### 5.2 Компоненты

```
components/
├── subscription/
│   ├── SubscriptionBanner.tsx    // "Upgrade to Pro"
│   ├── UpgradeModal.tsx          // Детали + кнопка оплаты
│   ├── SubscriptionStatus.tsx    // Текущий статус
│   └── PaywallGate.tsx           // Обёртка для ограниченного контента
```

### 5.3 Paywall точки

1. **Создание игры** — если gameIds.length >= 1 && !subscription.active
2. **Присоединение к игре** — аналогично
3. **Список игр** — показать бейдж "Pro" или лимит

### 5.4 UI компоненты

```tsx
// PaywallGate.tsx
function PaywallGate({ children }: { children: React.ReactNode }) {
  const { canCreateGame, openUpgradeModal } = useSubscription();

  if (!canCreateGame) {
    return (
      <div className="paywall">
        <p>Бесплатный план ограничен 1 игрой</p>
        <button onClick={openUpgradeModal}>Upgrade to Pro</button>
      </div>
    );
  }

  return <>{children}</>;
}
```

---

## Фаза 6: Обновить Game Logic

### 6.1 createGame function

```ts
async function createGame(userId: string, gameData: Partial<Game>) {
  const gameId = doc(collection(db, 'games')).id;
  const batch = writeBatch(db);

  // 1. Резервируем слот
  batch.update(doc(db, 'users', userId), {
    gameIds: arrayUnion(gameId)
  });

  // 2. Создаём игру
  batch.set(doc(db, 'games', gameId), {
    ...gameData,
    gmId: userId,
    playerIds: [],
    createdAt: serverTimestamp(),
  });

  await batch.commit();
  return gameId;
}
```

### 6.2 joinGame function

```ts
async function joinGame(gameId: string, userId: string) {
  const batch = writeBatch(db);

  // 1. Резервируем слот
  batch.update(doc(db, 'users', userId), {
    gameIds: arrayUnion(gameId)
  });

  // 2. Добавляем в игру
  batch.update(doc(db, 'games', gameId), {
    playerIds: arrayUnion(userId)
  });

  await batch.commit();
}
```

### 6.3 leaveGame function

```ts
async function leaveGame(gameId: string, userId: string) {
  const batch = writeBatch(db);

  // 1. Освобождаем слот
  batch.update(doc(db, 'users', userId), {
    gameIds: arrayRemove(gameId)
  });

  // 2. Убираем из игры
  batch.update(doc(db, 'games', gameId), {
    playerIds: arrayRemove(userId)
  });

  await batch.commit();
}
```

---

## Фаза 7: Paddle Dashboard Setup

### 7.1 Создать продукт

1. Products → Create Product
   - Name: "OmnisGM Pro"
   - Tax category: "Software as a Service"

### 7.2 Создать цену

1. Prices → Create Price
   - Recurring: Monthly / Yearly
   - Amount: $X.XX

### 7.3 Настроить Webhook

1. Developer Tools → Notifications
2. URL: `https://<region>-<project>.cloudfunctions.net/paddleWebhook`
3. Events:
   - subscription.activated
   - subscription.updated
   - subscription.canceled
   - subscription.paused
   - subscription.past_due

---

## Фаза 8: Тестирование

### 8.1 Unit tests

- [ ] Firestore rules: лимит игр без подписки
- [ ] Firestore rules: безлимит с подпиской
- [ ] Firestore rules: блок изменения subscription с клиента

### 8.2 Integration tests

- [ ] Создание игры free user (первая) — OK
- [ ] Создание игры free user (вторая) — BLOCK
- [ ] Создание игры pro user (любое кол-во) — OK
- [ ] Webhook активация подписки
- [ ] Webhook отмена подписки

### 8.3 E2E tests (Paddle Sandbox)

- [ ] Полный флоу покупки
- [ ] Отмена подписки
- [ ] Истечение подписки

---

## Порядок реализации

```
Week 1:
├── [ ] Фаза 1: Типы и миграция
├── [ ] Фаза 2: Security Rules
└── [ ] Фаза 3: Cloud Function (webhook)

Week 2:
├── [ ] Фаза 4: Paddle Client
├── [ ] Фаза 6: Game Logic updates
└── [ ] Фаза 8.1-8.2: Unit/Integration tests

Week 3:
├── [ ] Фаза 5: Frontend UI
├── [ ] Фаза 7: Paddle Dashboard
└── [ ] Фаза 8.3: E2E tests

Week 4:
├── [ ] QA и баг-фиксы
├── [ ] Soft launch (beta users)
└── [ ] Production deploy
```

---

## Риски и митигация

| Риск | Митигация |
|------|-----------|
| Webhook не доходит | Paddle retry + manual sync endpoint |
| Race condition при batch | Firestore transactions |
| Юзер застрял с невалидным gameIds | Admin tool для ручной синхронизации |
| Paddle sandbox vs production | Отдельные env variables |

---

## Полезные ссылки

- [Paddle Billing Docs](https://developer.paddle.com/build/subscriptions)
- [Paddle Webhooks](https://developer.paddle.com/webhooks/overview)
- [Firebase Functions Secrets](https://firebase.google.com/docs/functions/config-env)
- [Firestore Batch Writes](https://firebase.google.com/docs/firestore/manage-data/transactions)
