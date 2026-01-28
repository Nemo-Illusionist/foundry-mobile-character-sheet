# Plan: Separation of Business Logic from View Components ✅ COMPLETED

## Goal

Extract business logic from D&D 2024 character sheet components into custom hooks.
Each component should become a "dumb" view — only JSX rendering.
Follow the existing `useLevelXP` pattern.

---

## Step 0: Shared Utilities

**File:** `frontend/src/components/game-systems/dnd/dnd2024/utils/character.ts`

Add three functions that are currently duplicated or misplaced:

1. **`generateId()`** — duplicated in InventoryTab, SpellsTab, ActionsTab
2. **`formatCastingTime()`** — currently inside SpellsTab (pure formatting, no UI dependency)
3. **`calculateSpellStats()`** — currently inside SpellsTab (pure computation)

Update barrel export in `utils/index.ts` if needed.

**Files to modify after:**
- `SpellsTab.tsx` — remove inline `generateId`, `formatCastingTime`, `calculateSpellStats`; import from utils
- `InventoryTab.tsx` — remove inline `generateId`; import from utils
- `ActionsTab.tsx` — remove inline `generateId`; import from utils

**Verification:** `grep -r "Math.random().toString(36)" frontend/src/` should only show `character.ts`

---

## Step 1: `useCharacterStats` hook

**Purpose:** Eliminate 3-way duplication of inspiration, exhaustion, initiative, conditions logic.

**File:** `dnd2024/hooks/useCharacterStats.ts`

**Extracts from:**
- `CharacterSheet.tsx` (lines 65-79)
- `RightPanel.tsx` (lines 36-37, inline handlers at 68-72, 90-93)
- `CharacterHeader.tsx` (lines 28-39)

**Signature:**
```ts
function useCharacterStats(character: Character, gameId: string): {
  displayedInitiative: number;
  activeConditions: string[];
  conditionsCount: number;
  totalAC: number;
  handleInspirationToggle: () => Promise<void>;
  handleExhaustionChange: (level: number) => Promise<void>;
}
```

**Components to update:**
- `CharacterSheet.tsx` — remove handlers, use hook
- `RightPanel.tsx` — remove inline `updateCharacter` calls and imports, use hook
- `CharacterHeader.tsx` — remove handlers and `useCharacterMutation`, use hook

---

## Step 2: `useAbilities` hook

**Purpose:** Extract 6 mutation handlers from AbilitiesSection.

**File:** `dnd2024/hooks/useAbilities.ts`

**Extracts from:** `AbilitiesSection.tsx` (lines 19-69)

**Signature:**
```ts
function useAbilities(character: Character, gameId: string): {
  handleAbilityChange: (ability: AbilityName, value: number) => Promise<void>;
  handleSkillProficiencyToggle: (skill: SkillName) => Promise<void>;
  handleSavingThrowToggle: (ability: AbilityName) => Promise<void>;
  handleArmorTrainingToggle: (type: 'light' | 'medium' | 'heavy' | 'shields') => Promise<void>;
  handleWeaponProficienciesChange: (value: string) => Promise<void>;
  handleToolProficienciesChange: (value: string) => Promise<void>;
}
```

**Component to update:**
- `AbilitiesSection.tsx` — remove all handlers and `updateCharacter` import; ~170 → ~100 lines

---

## Step 3: `useInventory` hook

**Purpose:** Extract CRUD, currency, weight, filtering from InventoryTab.

**File:** `dnd2024/hooks/useInventory.ts`

**Extracts from:** `InventoryTab.tsx` (lines 25-84)

**Signature:**
```ts
function useInventory(character: Character, gameId: string): {
  // State
  editingItem: InventoryItem | null;
  setEditingItem: (item: InventoryItem | null) => void;
  filter: string;
  setFilter: (f: string) => void;
  // Computed
  items: InventoryItem[];
  filteredItems: InventoryItem[];
  totalWeight: number;
  // Handlers
  addItem: () => Promise<void>;
  updateItem: (id: string, updates: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleEquipped: (id: string, e: React.MouseEvent) => Promise<void>;
  updateCurrency: (coin: keyof Character['currency'], value: number) => Promise<void>;
}
```

**Component to update:**
- `InventoryTab.tsx` — remove all logic; ~210 → ~120 lines

---

## Step 4: `useActions` hook

**Purpose:** Extract CRUD and computed display functions from ActionsTab.

**File:** `dnd2024/hooks/useActions.ts`

**Extracts from:** `ActionsTab.tsx` (lines 25-86)

**Signature:**
```ts
function useActions(character: Character, gameId: string): {
  // State
  editingAction: CharacterAction | null;
  setEditingAction: (action: CharacterAction | null) => void;
  filter: string;
  setFilter: (f: string) => void;
  // Computed
  actions: CharacterAction[];
  filteredActions: CharacterAction[];
  // Handlers
  addAction: () => Promise<void>;
  updateAction: (id: string, updates: Partial<CharacterAction>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  getAttackBonus: (action: CharacterAction) => string;
  getDamageDisplay: (action: CharacterAction) => string;
}
```

**Component to update:**
- `ActionsTab.tsx` — remove all logic; ~150 → ~65 lines

---

## Step 5: `useSpells` hook

**Purpose:** Extract CRUD, slot management, spellcasting stats, filtering from SpellsTab.

**File:** `dnd2024/hooks/useSpells.ts`

**Extracts from:** `SpellsTab.tsx` (lines 58-161)

**Signature:**
```ts
function useSpells(character: Character, gameId: string): {
  // State
  editingSpell: CharacterSpellEntry | null;
  setEditingSpell: (spell: CharacterSpellEntry | null) => void;
  filter: 'all' | 'prepared' | 'ritual';
  setFilter: (f: 'all' | 'prepared' | 'ritual') => void;
  expandedLevels: Set<number>;
  toggleLevel: (level: number) => void;
  // Data
  spells: CharacterSpellEntry[];
  spellSlots: Record<string, { current: number; max: number }>;
  pactMagicSlots: Character['pactMagicSlots'];
  filteredSpells: CharacterSpellEntry[];
  spellsByLevel: Record<number, CharacterSpellEntry[]>;
  preparedCount: number;
  // Spellcasting stats
  spellcastingAbilities: AbilityName[];
  spellSaveDC: number;
  spellAttackBonus: number;
  abilityStats: Array<{ ability: AbilityName; spellModifier: number; spellSaveDC: number; spellAttackBonus: number }>;
  // Handlers
  addSpell: (level?: number) => Promise<void>;
  updateSpell: (id: string, updates: Partial<CharacterSpellEntry>) => Promise<void>;
  deleteSpell: (id: string) => Promise<void>;
  useSpellSlot: (level: number, delta: number) => Promise<void>;
  usePactMagicSlot: (delta: number) => Promise<void>;
}
```

**Component to update:**
- `SpellsTab.tsx` — remove all logic; ~330 → ~170 lines of JSX

---

## Step 6: `useHPModal` hook

**Purpose:** Extract ALL business logic from HPModal — the most complex component.

**File:** `dnd2024/hooks/useHPModal.ts`

**Extracts from:** `HPModal.tsx` (lines 28-198)

**Signature:**
```ts
function useHPModal(character: Character, gameId: string): {
  // HP State
  currentHP: number;
  tempHP: number;
  maxHP: number;
  hpBonus: number;
  effectiveMaxHP: number;
  amount: number;
  setAmount: (v: number) => void;
  // Short rest state
  showShortRestDialog: boolean;
  shortRestDiceType: string;
  shortRestDiceCount: number;
  setShortRestDiceType: (type: string) => void;
  setShortRestDiceCount: (count: number) => void;
  selectedTypeRemaining: number;
  // Computed
  classes: CharacterClass[];
  hitDiceGroups: HitDiceGroup[];
  hasMultipleClasses: boolean;
  // HP Handlers
  handleCurrentHPChange: (newHP: number) => Promise<void>;
  handleTempHPChange: (newTemp: number) => Promise<void>;
  handleHeal: () => Promise<void>;
  handleDamage: () => Promise<void>;
  handleMaxHPChange: (newMax: number) => Promise<void>;
  handleHPBonusChange: (newBonus: number) => Promise<void>;
  // Death saves
  handleDeathSaveSuccessChange: (count: number) => Promise<void>;
  handleDeathSaveFailureChange: (count: number) => Promise<void>;
  // Hit dice
  handleHitDiceUsedChange: (diceType: string, newUsed: number) => Promise<void>;
  // Rests
  toggleShortRestDialog: () => void;
  handleShortRest: () => Promise<void>;
  handleLongRest: () => Promise<void>;
}
```

**Notes:**
- Uses `useCharacterMutation` internally for persistence
- Keeps local state for optimistic UI updates (currentHP, tempHP sync)
- Consolidates damage logic duplication (HPModal vs useCharacterMutation)

**Component to update:**
- `HPModal.tsx` — remove ALL logic; ~375 → ~140 lines of JSX

---

## Step 7: `useCharacterSheetLayout` hook

**Purpose:** Extract scroll collapse, responsive detection, tab management from CharacterSheet.

**File:** `dnd2024/hooks/useCharacterSheetLayout.ts`

**Extracts from:** `CharacterSheet.tsx` (lines 28-168)

**Signature:**
```ts
function useCharacterSheetLayout(character: Character): {
  // State
  headerExpanded: boolean;
  mobileTab: MobileTabId;
  setMobileTab: (tab: MobileTabId) => void;
  isMobileMode: boolean;
  isTabletMode: boolean;
  isTrueMobile: boolean;
  conditionsOpen: boolean;
  setConditionsOpen: (open: boolean) => void;
  moreMenuOpen: boolean;
  setMoreMenuOpen: (open: boolean) => void;
  moreMenuRef: React.RefObject<HTMLDivElement>;
  // Computed
  visibleMainTabs: Array<{ id: MobileTabId; label: string }>;
  moreTabs: Array<{ id: MobileTabId; label: string }>;
  isMoreTabActive: boolean;
  // Handlers
  handleToggleExpand: () => void;
  getRightPanelTab: () => TabId | null;
}
```

**Component to update:**
- `CharacterSheet.tsx` — use `useCharacterSheetLayout` + `useCharacterStats`; ~315 → ~90 lines

---

## Step 8: Update barrel export

**File:** `dnd2024/hooks/index.ts`

Add exports for all 7 new hooks.

---

## Summary

### New files (8):
| File | Est. lines |
|------|-----------|
| `hooks/useCharacterStats.ts` | ~40 |
| `hooks/useAbilities.ts` | ~55 |
| `hooks/useInventory.ts` | ~70 |
| `hooks/useActions.ts` | ~65 |
| `hooks/useSpells.ts` | ~100 |
| `hooks/useHPModal.ts` | ~180 |
| `hooks/useCharacterSheetLayout.ts` | ~120 |
| **Total new** | **~630** |

### Modified files (10):
| File | Change |
|------|--------|
| `utils/character.ts` | +`generateId`, +`formatCastingTime`, +`calculateSpellStats` |
| `hooks/index.ts` | +7 new exports |
| `CharacterSheet.tsx` | 315 → ~90 lines |
| `CharacterHeader.tsx` | 190 → ~170 lines |
| `RightPanel.tsx` | 170 → ~150 lines |
| `AbilitiesSection.tsx` | 170 → ~100 lines |
| `InventoryTab.tsx` | 210 → ~120 lines |
| `ActionsTab.tsx` | 150 → ~65 lines |
| `SpellsTab.tsx` | 330 → ~170 lines |
| `HPModal.tsx` | 375 → ~140 lines |

### What is NOT changing:
- Service layer (`characters.service.ts`)
- Existing hooks (`useCharacterMutation`, `useLevelXP`, `useCharacter`)
- Shared UI components (`shared/`)
- Constants and existing utils
- No new state management library

---

## Verification

After each step:
1. `cd frontend && npx tsc --noEmit` — TypeScript compiles
2. `npm run dev` — app runs without errors
3. Manual test of affected component (all interactions, Firebase persistence)

Final integration test:
- Open character sheet on mobile (< 650px), tablet (650-849px), desktop (850px+)
- Test all tabs: abilities, actions, spells, inventory, bio, class
- Test HP modal: heal, damage, short rest, long rest
- Test header collapse/expand on mobile scroll
- Test inspiration, exhaustion, conditions in all responsive modes
