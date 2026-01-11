# D&D 2024 Character Manager

Standalone Progressive Web App for D&D 2024 character and game management.

Based on **D&D 2024 System Reference Document (SRD v5.2.1)**

## 🎯 Features

- **Authentication**: Firebase Auth (Email/Password)
- **Games Management**: Create games, invite players, GM controls
- **Personal Game**: Each user gets a private game for personal characters
- **Characters**: Full D&D 2024 character sheets with:
  - Abilities, Skills, Saving Throws
  - HP, AC, Speed, Initiative
  - Inventory & Equipment
  - Spells & Spell Slots
  - Currency & Resources
- **Knowledge Base**: Shared library per game for:
  - Spells
  - Items (Weapons, Armor, Adventuring Gear)
  - Races
  - Classes & Subclasses
  - Features & Traits
- **GM Controls**: GM-only items, player management, permissions
- **Real-time Sync**: Firestore real-time updates
- **PWA**: Install on mobile, offline support

## 🏗️ Architecture

```
mobile-character-sheet/
├── frontend/          # React PWA (TypeScript + Vite)
├── functions/         # Firebase Cloud Functions (TypeScript)
├── shared/            # Shared types/models (TypeScript)
├── firebase.json      # Firebase configuration
├── firestore.rules    # Security rules
└── firestore.indexes.json
```

### Technology Stack

- **Frontend**: React 18, TypeScript, Vite, React Router
- **Backend**: Firebase (Firestore, Auth, Cloud Functions, Hosting)
- **State**: React Context + Custom Hooks
- **Styling**: Custom CSS (Dark theme, mobile-first)
- **PWA**: vite-plugin-pwa

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project (create at [firebase.google.com](https://firebase.google.com))

### Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd mobile-character-sheet
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase setup**
   ```bash
   firebase login
   firebase init
   ```

   Select:
   - ✅ Firestore
   - ✅ Functions
   - ✅ Hosting
   - ✅ Emulators (Auth, Firestore, Functions)

4. **Configure Firebase**

   Create `frontend/src/config/firebase.config.ts`:
   ```typescript
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT.appspot.com",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```

### Development

**Option 1: Firebase Emulators (Recommended)**

Run everything locally without real Firebase:

```bash
npm run emulators
```

Then in another terminal:

```bash
npm run dev
```

Visit: http://localhost:5000

**Option 2: Production Firebase**

```bash
npm run dev
```

Visit: http://localhost:5173

### Building

```bash
npm run build
```

### Deployment

```bash
npm run deploy
```

Or deploy separately:

```bash
npm run deploy:hosting    # Frontend only
npm run deploy:functions   # Cloud Functions only
```

## 📱 PWA Installation

After deploying, users can install the app:

- **Mobile**: "Add to Home Screen"
- **Desktop**: Install icon in address bar

## 🔒 Security

Firestore security rules ensure:

- ✅ Users can only access their own profile
- ✅ Players see only characters they own
- ✅ GM sees all game content
- ✅ GM-only items hidden from players (client-side filter)
- ✅ Only game members can access game data
- ✅ Personal games are private

## 📖 D&D 2024 SRD v5.2.1 Compliance

This app uses official D&D 2024 terminology:

- **Abilities**: Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma
- **Skills**: Acrobatics, Animal Handling, Arcana, Athletics, etc.
- **Armor Types**: Light Armor, Medium Armor, Heavy Armor, Shield
- **Magic Schools**: Abjuration, Conjuration, Divination, etc.
- **Creature Sizes**: Tiny, Small, Medium, Large, Huge, Gargantuan

## 🎨 Design

- **Dark theme** optimized for gaming sessions
- **Mobile-first** responsive design
- **Touch-friendly** UI elements
- **Fast loading** with code splitting

## 🧪 Testing

### Emulator Testing

```bash
npm run emulators
```

Access:
- **Emulator UI**: http://localhost:4000
- **Firestore**: http://localhost:8080
- **Auth**: http://localhost:9099
- **Functions**: http://localhost:5001

### Test Scenarios

1. Create user account
2. Verify personal game auto-creation
3. Create new game
4. Create character
5. Add spell to knowledge base
6. Add spell from knowledge base to character
7. Test GM vs Player permissions

## 📚 Project Structure

### Frontend (`frontend/`)

```
src/
├── pages/              # Page components
├── components/         # Reusable UI components
├── services/           # Firebase services
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── utils/              # Helper functions
└── config/             # Configuration
```

### Functions (`functions/`)

```
src/
└── index.ts           # Cloud Functions (user lifecycle, etc.)
```

### Shared (`shared/`)

```
src/
└── types.ts           # D&D 2024 type definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Submit Pull Request

## 📄 License

MIT License - see LICENSE file

## 🔗 Resources

- [D&D 2024 SRD v5.2.1](https://www.dndbeyond.com/sources/dnd/free-rules)
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

---

**Note**: This is an independent project and is not affiliated with or endorsed by Wizards of the Coast. D&D and all related trademarks are property of Wizards of the Coast LLC.
