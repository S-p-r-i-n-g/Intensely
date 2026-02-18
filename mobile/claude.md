# 📱 CLAUDE MOBILE DIRECTORY MANDATE

You are currently operating inside the `mobile/` directory of the Intensely dual-environment repository. 

**1. LOCAL CONSTRAINTS (CRITICAL)**
* This is a React Native / Expo environment. 
* You are STRICTLY FORBIDDEN from using web DOM elements (`<div>`, `<span>`, `<p>`) or CSS modules in this directory.
* You must use `react-native-safe-area-context` for device cutouts. 

**2. GLOBAL ARCHITECTURE INHERITANCE**
Before writing any code, you MUST adhere to the global repository rules. If you do not have them in your active memory, you must read `../claude.md` (the root mandate) to understand:
* The strict Design System component enforcement (`ui/Button`, `ui/Text`).
* Data fetching rules (Zustand, centralized API clients).
* The "Double-Check Protocol" for ensuring web/mobile feature parity.