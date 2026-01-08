# Intensely Mobile App

React Native mobile application for the Intensely HICT workout app.

## Phase 6 Progress

### ✅ Completed

**Infrastructure**
- ✅ React Navigation setup (Stack + Tab navigators)
- ✅ API client with automatic auth token injection
- ✅ Supabase authentication integration
- ✅ Zustand state management stores (Auth, Workout, Session)
- ✅ TypeScript type definitions for API
- ✅ Environment configuration

**Authentication Flow**
- ✅ Welcome screen
- ✅ Login screen with form validation
- ✅ Sign up screen with password confirmation
- ✅ Automatic navigation based on auth state
- ✅ Session persistence with AsyncStorage

**Main App Structure**
- ✅ Bottom tab navigation (Home, Workouts, Exercises, Progress, Profile)
- ✅ Home screen with quick start options
- ✅ Profile screen with sign out
- ✅ Placeholder screens for all tabs

**API Services**
- ✅ Exercises API
- ✅ Workouts API (including workout flows)
- ✅ Sessions API (workout tracking)
- ✅ Progress API (PR tracking)
- ✅ Favorites API
- ✅ Users API

### 🚧 In Progress / Remaining

**Workout Flows**
- ⏳ Jump Right In implementation
- ⏳ Let Us Curate flow with objective selection
- ⏳ Take the Wheel custom workout builder

**Workout Execution**
- ⏳ Workout execution screen with live timer
- ⏳ Exercise instructions and demonstrations
- ⏳ Progress tracking during workout
- ⏳ Workout completion and rating

**Exercises & Favorites**
- ⏳ Exercise library browse and search
- ⏳ Exercise detail view
- ⏳ Favorites management

**Progress & Profile**
- ⏳ Progress overview with statistics
- ⏳ Exercise progress logging
- ⏳ Workout history
- ⏳ Profile editing
- ⏳ Preferences management

## Tech Stack

- **Framework:** React Native with Expo
- **Navigation:** React Navigation (Stack + Tab)
- **State Management:** Zustand
- **API Client:** Axios
- **Authentication:** Supabase Auth
- **Storage:** AsyncStorage
- **Language:** TypeScript

## Project Structure

```
src/
├── api/                 # API service layer
│   ├── client.ts       # Axios client with auth
│   ├── exercises.ts
│   ├── workouts.ts
│   ├── sessions.ts
│   ├── progress.ts
│   ├── favorites.ts
│   └── users.ts
├── config/             # App configuration
│   ├── env.ts          # Environment variables
│   └── supabase.ts     # Supabase client
├── navigation/         # React Navigation setup
│   ├── types.ts        # Navigation types
│   ├── RootNavigator.tsx
│   ├── AuthNavigator.tsx
│   └── MainNavigator.tsx
├── screens/            # App screens
│   ├── auth/           # Authentication screens
│   ├── home/
│   ├── workouts/
│   ├── exercises/
│   ├── progress/
│   └── profile/
├── stores/             # Zustand stores
│   ├── authStore.ts
│   ├── workoutStore.ts
│   └── sessionStore.ts
├── types/              # TypeScript types
│   └── api.ts          # API response types
└── utils/              # Utility functions

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Configuration

Create a `.env` file in the mobile directory:

```env
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Update `src/config/env.ts` with your backend API URL.

## Features

### Authentication
- Email/password sign up and login
- Session persistence
- Automatic token refresh
- Profile syncing with backend

### Workout Flows
Three ways to start a workout:
1. **Jump Right In** - Instant workout based on preferences
2. **Let Us Curate** - Objective-based with customization
3. **Take the Wheel** - Build custom workouts

### Workout Execution
- Live timer for intervals and rest periods
- Exercise instructions and demonstrations
- Progress tracking during workout
- Completion stats and ratings

### Exercise Library
- Browse all available exercises
- Filter by category, difficulty, equipment
- Favorite exercises
- View detailed instructions

### Progress Tracking
- Personal records for each exercise
- Workout history
- Progress statistics
- Achievement tracking

## API Integration

The app connects to the backend API at `http://localhost:3000/api` (development).

All API calls automatically include authentication tokens from Supabase.

## State Management

### Auth Store (`useAuthStore`)
- User authentication state
- Profile data
- Sign in/up/out actions
- Session management

### Workout Store (`useWorkoutStore`)
- Workout objectives
- Saved workouts
- Current workout selection

### Session Store (`useSessionStore`)
- Active workout session
- Current exercise/circuit/set
- Timer state
- Progress updates

## Development Notes

### Navigation
- Root navigator switches between Auth and Main stacks based on auth state
- Main navigator uses bottom tabs for primary navigation
- Each tab can have its own stack navigator for nested screens

### API Client
- Axios client with interceptors for auth token injection
- Automatic token refresh on 401 responses
- Centralized error handling

### Authentication Flow
- Supabase handles auth with email/password
- Tokens stored in AsyncStorage via Supabase client
- Backend API validates tokens and returns user profile
- Profile auto-syncs on login

## Next Steps

1. Implement workout flow screens (Jump Right In, Let Us Curate, Take the Wheel)
2. Build workout execution screen with timer
3. Create exercise library and detail screens
4. Add progress tracking and logging
5. Implement workout history
6. Add UI polish and animations
7. Implement offline support
8. Add push notifications
9. Create onboarding flow
10. Add analytics

## Testing

```bash
# Run tests (when implemented)
npm test

# Type checking
npx tsc --noEmit
```

## Building for Production

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Phase 6 Status

**Progress:** ~50% Complete

**Completed:**
- ✅ Core infrastructure
- ✅ Authentication
- ✅ API integration
- ✅ State management
- ✅ Basic navigation

**Remaining:**
- Workout flow screens
- Workout execution with timer
- Exercise library screens
- Progress tracking screens
- Profile and preferences
- UI polish

**Estimated Remaining Work:**
- Workout flows: 4-6 screens
- Execution screen: 1 complex screen with timer
- Exercise screens: 3-4 screens
- Progress screens: 2-3 screens
- Profile screens: 2-3 screens
- Polish and testing
