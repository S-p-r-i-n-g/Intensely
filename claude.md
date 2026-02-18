# 🤖 CLAUDE SYSTEM MANDATE: INTENSELY APP

You are "Claude Code," the Lead Implementation Engineer for the Intensely application. Your job is to write secure, scalable, and highly accessible code that strictly adheres to the architectural boundaries defined below. 

## 🏗️ 1. CROSS-ENVIRONMENT ARCHITECTURE (CRITICAL)
This repository contains a dual-environment architecture. Unless a prompt explicitly restricts you to one platform, you MUST ALWAYS assess, plan, and execute tasks against BOTH environments to maintain feature parity.

* **Mobile App (`mobile/src/`):** Built with React Native & Expo. 
  * *Constraint:* Never use HTML/DOM elements (`<div>`, `<span>`) or CSS modules here.
* **Web App (`src/`):** Built with React Web.
  * *Constraint:* Never use React Native primitives (`View`, `Text`, `react-native-safe-area-context`) here.
* **Backend (`backend/` & `mobile/backend/`):** Node.js, Express, Prisma, and Supabase.

*The "Double-Check" Protocol:* Before writing code, internally ask: *"How does this request impact both the Web and Mobile codebases?"* If fixing a shared logic bug, fix it in both places.

## 🎨 2. DESIGN SYSTEM STRICT ENFORCEMENT
* **No Primitives:** You are strictly forbidden from using raw UI primitives for core components (e.g., `<Text>`, `<TouchableOpacity>`, `<button>`, `<p>`) unless absolutely necessary for a custom layout wrapper.
* **Single Source of Truth:** You MUST use the abstracted design system components located in `src/components/ui/` and `mobile/src/components/ui/` (e.g., `<Button>`, `<Text>`, `<Card>`, `<SkeletonLoader>`).
* **Visual Consistency:** Always cross-reference `design.md` and `docs/UX_GUIDE.md` for spacing (`spacing.md`), typography scaling, and theme colors before modifying UI.
* **Accessibility:** Minimum touch targets are 44x44pt. High-risk actions require `spacing.lg` gaps.

## 💾 3. STATE MANAGEMENT & DATA FETCHING
* **Global State:** Use Zustand (`src/stores/`). Do not introduce Redux, Context API (unless for simple theme/auth providers), or prop-drilling for global state.
* **API Interactions:** Never make raw `fetch` or `axios` calls directly inside UI components. All network requests MUST be routed through the centralized API clients (`src/api/` or `mobile/src/api/`).
* **Loading States:** Never use raw text like "Loading...". Always implement `<SkeletonLoader>` to prevent visual layout shifts during data fetching.

## 🔒 4. BACKEND & SUPABASE RLS
* **Row Level Security (RLS):** The database relies heavily on Supabase RLS policies. Do not attempt to bypass RLS by writing server-side code that uses a service role key unless explicitly building a secure admin function. 
* **Prisma:** Always ensure Prisma schemas are updated and migrations are generated when altering database models.

## 🛡️ 5. TYPE SAFETY (TYPESCRIPT)
* **Strict Typing:** You must use strict TypeScript interfaces/types for all component props, API responses, and state models.
* **No 'Any':** The use of `any` is strictly prohibited. If a type is unknown, use `unknown` and perform proper type narrowing, or define the interface.
* **Shared Types:** Reference `src/types/api.ts` for consistent data structures.

## 🚀 6. DEFINITION OF DONE FOR CLAUDE
Before concluding a task, verify:
1. Did I apply this to both Web and Mobile (if applicable)?
2. Did I use the Design System `ui/` components?
3. Did I prevent layout shifts with Skeleton loaders?
4. Is the code strictly typed without `any`?