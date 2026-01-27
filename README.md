# Intensely

A mobile fitness app for High-Intensity Circuit Training (HICT). Build custom workouts, browse a full exercise library, and execute timed interval sessions with guided exercise progression.

Runs on iOS, Android, and web.

## Features

### Three Ways to Work Out

- **Jump Right In** — One tap generates an instant workout based on your fitness level. Regenerate as many times as you want until you find one you like.
- **New Workout** — Full custom workout builder. Choose your exercises, configure circuits, sets, work/rest intervals, warm up, and cool down. Sync exercises across all circuits or customize each circuit independently.
- **Start Workout** — Pick from your saved workouts and jump straight into a session.

### Workout Builder

Create workouts with full control over structure and timing:

- 1-10 circuits with 1-5 sets per circuit
- Work intervals: 10, 15, 20, 30, 45, or 60 seconds
- Rest intervals: 15, 30, 60, 90, or 120 seconds
- Optional warm up and cool down (up to 5 minutes each)
- Sync exercises across all circuits, or customize each circuit with different exercises
- Pick exercises from the full exercise library with search and filtering
- Name your workout on save

### Live Workout Execution

Full-screen guided workout experience:

- Large countdown timer with color-coded intervals (work, rest, circuit rest)
- Overall progress bar showing workout completion
- Current circuit, set, and exercise indicators
- Exercise name, instructions, and target muscle groups displayed during each interval
- Pause, resume, skip, and go-back controls
- Elapsed time tracking
- Session recorded on completion with duration and estimated calories

### Exercise Library

- Browse and search hundreds of exercises
- Filter by difficulty (Beginner, Intermediate, Advanced)
- Filter by target muscle group (Chest, Back, Shoulders, Arms, Legs, Core, Glutes, Cardio)
- Detailed exercise view with step-by-step instructions, pro tips, common mistakes, and target muscles
- Favorite exercises for quick access
- Video tutorial links where available

### Saved Workouts

- View all your created workouts in one place
- See key stats at a glance: circuits, exercises, estimated duration, difficulty
- Quick-start any saved workout
- Pull-to-refresh

### Account & Profile

- Email/password sign up and login
- Persistent login sessions
- Profile with name and email display
- Sign out with confirmation

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Expo CLI
- iOS Simulator (Mac), Android Emulator, or a web browser

### Installation

```bash
cd mobile

# Install dependencies
npm install

# Start the development server
npm start

# Or run directly on a platform
npm run ios
npm run android
npm run web
```

### Configuration

Create a `.env` file in the `mobile/` directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

The app connects to a backend API for exercise data, workout storage, and session tracking. Configure the API URL in `mobile/src/config/env.ts`.

## Tech Stack

- **React Native** with **Expo**
- **TypeScript**
- **React Navigation** (stack + tab navigators)
- **Supabase** (authentication)
- **Axios** (API client)
- **Zustand** (state management)
- **AsyncStorage** (session persistence)

## Building for Production

```bash
cd mobile

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## License

All rights reserved.
