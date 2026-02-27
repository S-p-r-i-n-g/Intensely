# Project Memory: Intensely App

## Critical: Project Structure
- **Vercel builds from `mobile/` subdirectory** (rootDirectory setting in Vercel project)
- All production code changes must be made in `mobile/src/`, NOT root `src/`
- Root `src/` and `mobile/src/` are diverged copies — `mobile/src/` has additional fixes (snake_case field handling, etc.)
- Vercel project name: `intenselyapp` (not `intensely-mobile`)
- Production URL: https://intenselyapp.vercel.app/

## Deployment
- Vercel auto-deploys on every push to `main` branch of `S-p-r-i-n-g/Intensely`
- Vercel CLI installed globally, authenticated as daniel-springs-projects
- `vercel link` is set to `intenselyapp` project

## Tech Stack
- Expo / React Native (web via `expo export --platform web`)
- Supabase for auth and database
- Zustand for state management
- `react-native-heroicons` for icons (NOT lucide-react-native)
- StyleSheet.create for styling (NOT NativeWind/Tailwind className)
- Button component: uses `children` prop (not `title`), size values: `small/medium/large` (not `lg`)

## Supabase Data — Known Patterns
- **DB uses snake_case, TypeScript uses camelCase.** Always map with `mapDbUser()` (read) and `mapUserToDb()` (write) — never cast raw rows with `as User`. This applies to all tables.
- The `workouts` table already handles this with `??` fallbacks (e.g. `w.estimated_duration_minutes ?? w.estimatedDurationMinutes`). The `users` table mappers are in `mobile/src/api/users.ts`.

## Supabase Web Auth — Known Footguns
- **`lock: false` does NOT disable LockManager.** Supabase JS checks `if (settings.lock)`, so falsy values fall through to `navigator.locks`. Use a no-op function instead: `(_name, _timeout, fn) => fn()`
- **`detectSessionInUrl: true` on web destroys sessions on normal refresh.** Supabase attempts URL-based auth recovery on every load. Use `shouldDetectSessionInUrl()` that checks for `?code=` or `#access_token=` in the URL first.
- **`supabase.auth.getUser()` is a network call.** Use `getSession()` for local reads in API methods.
- **`syncProfile()` should not block `isInitialized`.** Fire-and-forget it so the app renders immediately.

## React Native Web — Known Layout Footguns
- **Horizontal ScrollView collapses to ~0 height on web.** RN Web internally applies `align-items: center` to the ScrollView's outer div. Without an explicit height the cross-axis collapses to just padding, clipping all children. No amount of `alignItems`/`alignSelf`/`height` workarounds on children is reliable. **Fix: use a plain `View` with `flexDirection:'row'` + `flexWrap:'wrap'` instead** — works on web and native with no quirks.
- Shared filter chip component lives at `mobile/src/components/exercises/FilterChip.tsx`

## Key Files
- `mobile/src/config/supabase.ts` — Supabase client
- `mobile/src/stores/authStore.ts` — Auth state (Zustand)
- `mobile/src/api/users.ts` — User profile API
- `mobile/src/navigation/RootNavigator.tsx` — Auth routing
- `mobile/src/components/ui/Button.tsx` — Button component
- `mobile/src/theme/ThemeContext.tsx` — Theme (light/dark)
- `mobile/src/tokens/` — Design tokens (colors, spacing, etc.)

## CLAUDE.md Mandate — Accuracy Notes (2026-02-20 audit)
- CLAUDE.md describes a "dual environment" (src/ = React Web, mobile/src/ = React Native). This is MISLEADING.
- Reality: `mobile/src/` is the canonical codebase for BOTH web and native (Expo). `src/` is a diverged older copy that is NOT deployed.
- Therefore: For all new features, work ONLY in `mobile/src/`. Do NOT make parallel changes to root `src/`.
- CLAUDE.md's constraint "never use RN primitives in src/" is irrelevant because `src/` is not the active web app.
- `mobile/src/components/ui/` has 11 components (including Accordion, MultiPillSelector). Root `src/components/ui/` has only 9 (missing those 2) — ignore root src/ gaps.

## Known Code Quality Issues (2026-02-20)
- 89+ `any` type uses in `mobile/src/` — violates mandate (key locations: authStore.ts:18, supabase.ts:40, client.ts:13)
- 44 console.log statements in `mobile/src/` production code paths
- 4 `@ts-ignore` for cross-stack navigation (NewWorkoutScreen, WorkoutPreviewScreen)
- 1 TODO: WorkoutCompleteScreen — navigation to history screen not implemented
- No ESLint or Prettier configured at project level
- No CI/CD (GitHub Actions) configured
