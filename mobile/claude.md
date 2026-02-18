# 📱 CLAUDE MOBILE DIRECTORY MANDATE

You are currently operating inside the `mobile/` directory of the Intensely dual-environment repository.

**1. LOCAL CONSTRAINTS (CRITICAL)**
* This is a React Native / Expo environment.
* You are STRICTLY FORBIDDEN from using web DOM elements (`<div>`, `<span>`, `<p>`) or CSS modules in this directory.
* You must use `react-native-safe-area-context` for device cutouts.

**2. GLOBAL ARCHITECTURE & DESIGN INHERITANCE**
Before writing any code, you MUST adhere to the global repository rules. If you do not have them in your active memory, you must read the following files located in the parent root directory:
* **System Rules:** Read `../claude.md` for strict Design System component enforcement (`ui/Button`, `ui/Text`), data fetching, and the "Double-Check Protocol".
* **Design System:** Read `../design.md` for typography, color tokens, and cross-platform UI standards. DO NOT look for a local `mobile/design.md` file.
* **UX Guide:** Read `../docs/UX_GUIDE.md` for spacing, touch targets, and component specifications.
