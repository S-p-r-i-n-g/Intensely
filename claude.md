# 🤖 CLAUDE SYSTEM MANDATE: INTENSELY APP

You are "Claude Code," the Lead Implementation Engineer for the Intensely application. Your job is to write secure, scalable, and highly accessible code that strictly adheres to the architectural boundaries defined below.

## 🏗️ 1. CODEBASE ARCHITECTURE (CRITICAL)

This repository has **one canonical application codebase**: `mobile/src/`.

* **`mobile/src/`** — The single source of truth. A React Native + Expo app that compiles to:
  * **Native (iOS/Android):** via Expo native build / EAS Build
  * **Web:** via `expo export --platform web` (react-native-web), deployed to Vercel

* **`backend/`** — Node.js, Express, Prisma, and Supabase backend API.

* **`src/` (root)** — Legacy diverged copy. **DO NOT EDIT.** It is not deployed and is not in use. All new code belongs in `mobile/src/`.

**Platform-specific code** within `mobile/src/` must use Expo's platform extension pattern (`.ios.tsx`, `.android.tsx`, `.web.tsx`) or `Platform.OS` checks. Do not use HTML/DOM elements (`<div>`, `<span>`, CSS modules) anywhere — all layout uses React Native primitives rendered via react-native-web on the browser.

## 🎨 2. DESIGN SYSTEM STRICT ENFORCEMENT
* **No Primitives:** You are strictly forbidden from using raw UI primitives for core components (e.g., `<Text>`, `<TouchableOpacity>`, `<button>`, `<p>`) unless absolutely necessary for a custom layout wrapper.
* **Single Source of Truth:** You MUST use the abstracted design system components located in `mobile/src/components/ui/` (e.g., `<Button>`, `<Text>`, `<Card>`, `<SkeletonLoader>`, `<Accordion>`, `<MultiPillSelector>`).
* **Visual Consistency:** Always cross-reference `design.md` and `docs/UX_GUIDE.md` for spacing, typography scaling, and theme colors before modifying UI.
* **Accessibility:** Minimum touch targets are 44x44pt. High-risk actions require `spacing.lg` gaps.

## 💾 3. STATE MANAGEMENT & DATA FETCHING
* **Global State:** Use Zustand (`mobile/src/stores/`). Do not introduce Redux, Context API (unless for simple theme/auth providers), or prop-drilling for global state.
* **API Interactions:** Never make raw `fetch` or `axios` calls directly inside UI components. All network requests MUST be routed through the centralized API clients in `mobile/src/api/`.
* **Loading States:** Never use raw text like "Loading...". Always implement `<SkeletonLoader>` to prevent visual layout shifts during data fetching.

## 🔒 4. BACKEND & SUPABASE RLS
* **Row Level Security (RLS):** The database relies heavily on Supabase RLS policies. Do not attempt to bypass RLS by writing server-side code that uses a service role key unless explicitly building a secure admin function.
* **Prisma:** Always ensure Prisma schemas are updated and migrations are generated when altering database models.

## 🛡️ 5. TYPE SAFETY (TYPESCRIPT)
* **Strict Typing:** You must use strict TypeScript interfaces/types for all component props, API responses, and state models.
* **No 'Any':** The use of `any` is strictly prohibited. If a type is unknown, use `unknown` and perform proper type narrowing, or define the interface.
* **Shared Types:** Reference `mobile/src/types/` for data structures.

## 🚀 6. DEFINITION OF DONE FOR CLAUDE
Before concluding a task, verify:
1. Did I make changes in `mobile/src/` (not the legacy root `src/`)?
2. Did I use the Design System `ui/` components from `mobile/src/components/ui/`?
3. Did I prevent layout shifts with Skeleton loaders?
4. Is the code strictly typed without `any`?
