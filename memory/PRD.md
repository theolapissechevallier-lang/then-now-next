# Then-Now-Next — PRD

## Original problem statement
Repository: https://github.com/theolapissechevallier-lang/then-now-next

Existing features: Authentication, database persistence, coins, streaks, pet system, avatar system, shop, goals, trophies.

Features delivered in this session cycle:
1. **Custom Goals** with XP + Coin rewards, simple/quantitative types, difficulty presets, trophy showcase.
2. **Trophy Room** with auto-unlock achievement engine, pixel-art trophies/badges, prestige stats, shareable cards.
3. **Custom Habits — XP rewards & connections to Pet XP / User XP / Streaks / Trophy Room.**

## Tech stack
- Vite + TanStack Start (React 19, TypeScript), Supabase, Tailwind v4, Radix UI, lucide-react, pure Canvas 2D.

## Architecture — Custom Habits (2026-06-14)

### Database (migration `010_habit_xp_and_user_xp.sql`)
- `user_habits.xp_per_unit INTEGER NOT NULL DEFAULT 0`
- `habit_logs.xp_earned INTEGER NOT NULL DEFAULT 0`
- `profiles.xp INTEGER NOT NULL DEFAULT 0` (lifetime User XP, separate from pet XP)

### Types
- `Habit.xpPerUnit: number` and `HabitLog.xpEarned: number` added.
- `calculateHabitXp(habit, value)` — same unit logic as coins, scaled by `xpPerUnit` and difficulty multiplier.

### Data sync (`src/lib/data-sync.ts`)
- `DbProfile.xp`, `DbUserHabit.xp_per_unit`, `DbHabitLog.xp_earned` columns mapped in load/create/update/log functions.
- New `updateUserXp(user, xp)` mutator on `profiles`.
- `saveHabitLog` now accepts `xpEarned` and writes it (default 0 for backward compat).

### Store (`src/lib/store.ts`)
- `AppState.xp` (User XP) added with default 0 and migrated through local cache.
- New `addUserXp(amount)` action — optimistically updates state and persists to `profiles.xp`.

### Habit store (`src/lib/habit-store.tsx`)
- `setHabitValue` computes both `coinsEarned` and `xpEarned` from the habit definition and stores both on the log row.
- Local-storage fallback for habits + logs is now schema-safe (defaults `xpPerUnit`/`xpEarned` to 0 when loading older payloads).

### Habit editor UI (`src/routes/habits.tsx`)
- New **"XP per unit"** slider (0–10) alongside the existing **Coins per unit** slider, with helper text: *"XP feeds your pet AND your personal level."*
- Edit form state initializes from existing habit and persists new value on save.
- Removed accidental dead `useState;` expression that was tripping linting.

### Track page integration (`src/routes/track.tsx`)
When a habit value is updated:
1. Persist the log via `setHabitValue` (DB stores both coins + xp).
2. Compute positive-only deltas vs the previous log → call `addCoins(coinsDelta)` and `addUserXp(xpDelta)`.
3. Pet XP rewards stack:
   - Fixed `XP_REWARDS.habitTargetMet` on first time hitting the daily target.
   - Fixed `XP_REWARDS.habitCompleted` on first non-zero log of the day.
   - Per-habit `xpDelta` also flows into the pet via `usePet().addXP`.
4. The first non-zero log of the day triggers `checkIn()` so habit completion now contributes to the daily streak (no more requiring a separate manual check-in).

### Trophy Room integration (`src/routes/trophies.tsx`)
- Quick-stats row expanded from 3 to 4 tiles: Goals · Streak · **User XP** · Pet XP.
- Habit completions feed the existing achievements engine (counted via `fetchLifetimeHabitCompletions`) — unchanged behaviour, but now every habit log triggers richer evaluation because streaks + pet XP move in lockstep.

### Verification
- `tsc --noEmit` → 0 errors.
- `eslint --fix` → 0 errors (pre-existing react-refresh warnings only).
- `vite build --mode development` → success, `trophies-*.js` 25.16 kB, no chunk regression.
- Live screenshot of the **Create new habit** dialog confirms the new XP slider, helper text, and existing controls rendering cleanly.
- Smoke probes `/`, `/track`, `/goals`, `/trophies`, `/habits`, `/pet`, `/shop`, `/settings` all returned 200.

## What's implemented (history)
- 2026-06-14a: Custom Goals (XP + Coin rewards, simple + quantitative types, difficulty presets, trophy showcase).
- 2026-06-14b: Trophy Room (achievements catalog, auto-unlock engine, pixel-art trophies/badges, prestige header, share cards).
- 2026-06-14c: Custom Habits — per-habit XP rewards + User XP, Pet XP, streak, and Trophy Room hookup.

## P0 backlog
- Apply Supabase migrations **008, 009, 010** to the live project (Lovable should auto-apply; otherwise run via Supabase SQL editor).

## P1 backlog
- "Recently unlocked" timeline feed in Trophy Room.
- Animated unlock modal with confetti + sound.
- Show User XP on the Today/home header alongside coins.
- Per-rarity filter on Trophy Room.

## P2 backlog
- Public shareable trophy profile URL `/u/{handle}/trophies`.
- Habit templates ("Drink water", "Meditate") quick-add presets.
- Seasonal/limited-time achievements.

## Action item for user
Apply the three new migrations in your Supabase project:
1. `20260614004000_008_goals_xp_and_types.sql`
2. `20260614005000_009_user_achievements.sql`
3. `20260614010000_010_habit_xp_and_user_xp.sql`
