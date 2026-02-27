# ⚠️ DEPRECATED — DO NOT EDIT

This directory (`src/`) is **not deployed** and is **not the active codebase**.

## What to use instead

All active development happens in **`mobile/src/`**, which is the single canonical codebase for both web (Expo web → Vercel) and native (iOS/Android via EAS Build).

## Why this exists

`src/` is a diverged legacy copy from an earlier architectural experiment. It has fallen behind `mobile/src/` in bug fixes and features (e.g., missing Supabase session handling improvements, snake_case/camelCase field mapping).

## What to do

- **New features:** Write in `mobile/src/` only.
- **Bug fixes:** Fix in `mobile/src/` only.
- **This directory:** Safe to ignore. Will be removed in a future cleanup.
