# 📱 CLAUDE MOBILE DIRECTORY MANDATE

You are currently operating inside the `mobile/` directory — the **canonical codebase** for the Intensely app (web + native).

**1. LOCAL CONSTRAINTS (CRITICAL)**
* This is a React Native / Expo environment. All code here runs on iOS, Android, and web (via react-native-web).
* You are STRICTLY FORBIDDEN from using web DOM elements (`<div>`, `<span>`, `<p>`) or CSS modules in this directory.
* You must use `react-native-safe-area-context` for device cutouts.

**2. GLOBAL ARCHITECTURE & DESIGN INHERITANCE**
Before writing any code, you MUST adhere to the global repository rules. If you do not have them in your active memory, read:
* **System Rules:** `../CLAUDE.md` — Design System enforcement, state management, type safety, definition of done.
* **Design System:** `../design.md` — typography, color tokens, cross-platform UI standards.
* **UX Guide:** `../docs/UX_GUIDE.md` — spacing, touch targets, component specifications.
