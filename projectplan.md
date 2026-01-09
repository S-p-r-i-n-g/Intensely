# Intensely - HICT Workout App
## Project Plan

---

## Vision & Core Philosophy

**Intensely** is a mobile-first HICT workout app that prioritizes simplicity, personalization, and guidance. Unlike cluttered fitness apps, Intensely gets users working out fast while providing the flexibility to customize when they want it.

**Core Differentiators:**
- Zero friction to first workout
- Intelligent workout curation
- High-fidelity exercise demonstrations
- Clean, minimalist design
- Progressive complexity (simple → curated → custom)

---

## Technical Architecture

### Platform & Stack
- **Frontend:** React Native (iOS & Android from single codebase)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (structured data for exercises, workouts, users)
- **Media Storage:** AWS S3 or Cloudflare R2 (exercise animations/images)
- **Authentication:** Firebase Auth or Supabase Auth
- **State Management:** React Context + React Query
- **Timer/Workout Engine:** Custom React Native module with accurate timing
- **Deployment:**
  - Backend: Railway/Render/Fly.io
  - Mobile: Expo for development, EAS Build for production

### Why These Choices?
- React Native enables mobile-first development with web potential later
- PostgreSQL handles complex exercise taxonomy queries efficiently
- Supabase could provide auth + database + storage in one platform
- React Query manages server state elegantly for workout data

---

## Development Phases

### Phase 0: Research & Foundation (Week 1-2)
**Checkpoint: RESEARCH_COMPLETE**

### Phase 1: Core Infrastructure (Week 2-3)
**Checkpoint: INFRASTRUCTURE_READY**

### Phase 2: Exercise Taxonomy System (Week 3-5)
**Checkpoint: TAXONOMY_BUILT**

### Phase 3: Workout Engine (Week 5-7)
**Checkpoint: ENGINE_FUNCTIONAL**

### Phase 4: User Flows & Onboarding (Week 7-9)
**Checkpoint: ONBOARDING_COMPLETE**

### Phase 5: Workout Builder (Week 9-11)
**Checkpoint: BUILDER_COMPLETE**

### Phase 6: Polish & Launch Prep (Week 11-12)
**Checkpoint: MVP_LAUNCH_READY**

---

## Detailed Task Breakdown

### Phase 0: Research & Foundation
**Goal:** Build the knowledge base that powers intelligent workout creation

#### Tasks:
- [x] **Research open-source exercise libraries** ✓
  - Evaluated wger.de API, ExerciseDB API, Free Exercise DB, API Ninjas
  - Decision: **Free Exercise DB** (public domain, 800+ exercises, cacheable)
  - Hybrid approach: Free Exercise DB + optional ExerciseDB for premium
  - See: `/research/exercise-library-research.md`

- [x] **Research HICT/bodyweight/HIIT exercises** ✓
  - Compiled 120+ bodyweight exercises organized by muscle groups
  - Documented 7 major exercise families with variants
  - Created comprehensive difficulty progressions
  - See: `/research/hict-exercise-research.md`

- [x] **Define exercise taxonomy structure** ✓
  - 7 primary categories, difficulty levels, equipment tags
  - Movement patterns, force types, mechanic types
  - Exercise families with relationships
  - Suitability tags for filtering
  - See: `/research/exercise-taxonomy.md`

- [x] **Research workout objectives** ✓
  - Defined 9 workout objectives for MVP launch:
    1. Fat Burn & Weight Loss
    2. Muscle Endurance
    3. Cardiovascular Conditioning
    4. Strength Building
    5. Core Stability
    6. Functional Fitness
    7. Athletic Performance
    8. Flexibility & Mobility
    9. Full Body Conditioning
  - Mapped objectives to recommended workout structures
  - See: `/research/workout-objectives.md`

- [x] **Design database schema** ✓
  - 14 tables designed for PostgreSQL
  - Comprehensive taxonomy implementation
  - Workout structure with circuits and exercises
  - User management, preferences, history tracking
  - See: `/research/database-schema.md`

- [x] **Source or create exercise demonstration media** ✓
  - Strategy: Free Exercise DB images (public domain)
  - CDN: Cloudflare R2 for hosting (~$1/month)
  - Future: ExerciseDB GIFs for premium tier
  - Media pipeline and optimization strategy defined
  - See: `/research/media-sourcing-strategy.md`

### Phase 1: Core Infrastructure
**Goal:** Set up development environment and core systems

#### Tasks:
- [x] **Initialize project** ✓
  - Set up React Native project with Expo + TypeScript ✓
  - Create backend project structure (routes, controllers, services, utils) ✓
  - Configure TypeScript for backend ✓
  - Initialize Git repository (in /mobile) ✓

- [x] **Backend setup** ✓ (80% complete)
  - Initialize Node.js/Express server ✓
  - Configure environment variables ✓
  - Set up Prisma ORM with complete schema (14 models) ✓
  - Backend running at http://localhost:3000 ✓
  - Health check endpoint working ✓
  - Create seed data script ⏳ (next step)
  - Run database migrations ⏳ (waiting on Supabase setup)

- [ ] **Database setup** ⏳ (IN PROGRESS)
  - Decision: Use Supabase (PostgreSQL + Auth + Storage)
  - User needs to: Create Supabase project
  - User needs to: Add DATABASE_URL to .env
  - Then run: `npx prisma migrate dev --name init`
  - See: `/backend/SETUP.md` for detailed instructions

- [ ] **Authentication system** (NEXT)
  - Integrate Supabase Auth
  - Implement email/password signup
  - Implement social auth (Google, Apple)
  - Create auth context/hooks for frontend
  - Build minimalist login/signup modal

- [ ] **Basic API structure** (NEXT)
  - Set up REST endpoints structure
  - Implement error handling middleware ✓ (basic)
  - Add request validation (Zod)
  - CORS configured ✓
  - Create API client service for frontend

- [x] **Development tooling** ✓
  - Hot reload for backend (nodemon + tsx) ✓
  - Development scripts (dev, build, prisma commands) ✓
  - Prisma Studio ready (after migration)
  - Expo dev server ready for mobile ✓

### Phase 2: Exercise Taxonomy System
**Goal:** Build the authoritative exercise database

#### Tasks:
- [ ] **Import exercise data**
  - Write scripts to import from chosen open-source library
  - Parse and normalize exercise data
  - Import into local database
  - Add custom exercises not in source library

- [ ] **Build taxonomy structure**
  - Implement category/subcategory relationships
  - Tag exercises with attributes (muscle groups, equipment, etc.)
  - Assign difficulty levels to all exercises
  - Create exercise families/variants relationships
  - Add descriptive metadata (instructions, tips, common mistakes)

- [ ] **Exercise media pipeline**
  - Upload exercise GIFs/videos to cloud storage
  - Generate thumbnails if needed
  - Store media URLs in database
  - Implement lazy loading/caching strategy
  - Create fallback for missing media

- [ ] **Exercise API endpoints**
  - GET /api/exercises (with filtering, sorting, pagination)
  - GET /api/exercises/:id
  - GET /api/exercises/categories
  - GET /api/exercises/search?q=query
  - GET /api/exercises/:id/variants
  - POST /api/exercises (admin only for now, user-created later)

- [ ] **Exercise browsing UI component**
  - Create ExerciseCard component (shows thumbnail, name, difficulty)
  - Create ExerciseDetailModal (full info, animated demo, attributes)
  - Build filter/sort controls
  - Implement search bar with debouncing
  - Create category browser
  - Add "show variants" functionality

### Phase 3: Workout Engine
**Goal:** Build the core workout execution system

#### Tasks:
- [ ] **Workout data model**
  - Define Workout object structure
  - Define Circuit object structure
  - Define workout notation parser (3x3x20+60x3)
  - Create default workout templates
  - Build workout validation logic

- [ ] **Timer engine**
  - Build accurate countdown timer (not reliant on React re-renders)
  - Implement interval transitions (exercise → exercise → rest)
  - Add pause/resume functionality
  - Implement background timer (works when app backgrounded)
  - Add sound/vibration alerts for transitions

- [ ] **Workout execution state machine**
  - States: Idle → Ready → Running → Paused → Completed
  - Track current circuit, set, exercise, time remaining
  - Implement progress tracking (X of Y circuits complete)
  - Handle edge cases (skip exercise, adjust on-the-fly)

- [ ] **Workout Mode UI**
  - Create WorkoutOutline screen (overview before starting)
  - Create WorkoutRun screen (main execution view)
  - Build countdown timer display (large, clear)
  - Implement exercise name/demo display
  - Show progress indicators (circuit progress, set progress)
  - Add pause/exit buttons
  - Create 5-second preview before next exercise

- [ ] **Exercise demonstration integration**
  - Display animated GIF/video during exercise intervals
  - Implement picture-in-picture preview (5s before transition)
  - Ensure smooth loading/caching
  - Add controls (pause demo if needed)

- [ ] **Workout completion**
  - Save completed workout to history
  - Show workout summary (time, circuits completed, calories estimate?)
  - Add celebration/motivation messaging
  - Provide "Save as template" option
  - Return to home/workout library

- [ ] **Workout API endpoints**
  - POST /api/workouts (create/save workout)
  - GET /api/workouts (user's saved workouts)
  - GET /api/workouts/:id
  - PUT /api/workouts/:id (edit)
  - DELETE /api/workouts/:id
  - POST /api/workouts/:id/complete (log completion)
  - GET /api/workouts/history

### Phase 4: User Flows & Onboarding
**Goal:** Create the three entry pathways

#### Tasks:
- [ ] **Onboarding screen design**
  - Create landing screen with three options
  - Design option cards (Jump In, Let Us Curate, Take the Wheel)
  - Make it visually compelling and clear
  - Add brief explanations for each option

- [ ] **Jump Right In flow**
  - Select default workout structure (e.g., 3x3x20+60x3)
  - Randomly select exercises (balanced across muscle groups)
  - Generate workout instantly
  - Go directly to Workout Mode
  - No account required
  - Add "Save this workout" CTA after completion (prompts signup)

- [ ] **Let Us Curate flow**
  - Design minimal preference collection screen
  - Workout Objective selector (single choice)
  - Difficulty Level selector (Beginner/Intermediate/Advanced)
  - Build curation algorithm:
    - Map objective → recommended workout structure
    - Filter exercises by difficulty level
    - Select balanced exercises (don't repeat muscle groups consecutively)
    - Ensure variety across circuits
  - Show generated workout
  - Offer "Start Workout" or "Customize Exercises"
  - "Customize" triggers inline auth modal → then to "Let Me Pick"

- [ ] **Take the Wheel flow**
  - Trigger auth modal immediately
  - After auth, show preference collection (same as Curate)
  - Add workout structure customization:
    - Number of circuits (1-5)
    - Exercises per circuit (2-6)
    - Interval duration (10s, 15s, 20s, 30s, 45s, 60s)
    - Rest duration (15s, 30s, 45s, 60s, 90s, 120s)
    - Set reps (1-5)
  - Show preview of workout structure
  - Offer "Suggest Exercises" or "Let Me Pick"

- [ ] **Inline auth modal**
  - Design as overlay (doesn't leave current flow)
  - Tab-based: Sign Up / Log In
  - Email + password
  - Social auth buttons
  - "Continue as Guest" option (for Jump Right In only)
  - Smooth transition back to flow after auth

- [ ] **Workout suggestion algorithm**
  - Input: objective, difficulty, structure, user history (optional)
  - Logic:
    - Filter exercises by difficulty
    - Prioritize exercises matching objective
    - Ensure muscle group distribution (no 3 leg exercises in a row)
    - Consider user history (avoid repeating recent workouts)
    - Randomize within constraints
  - Output: Complete workout with all exercises selected

### Phase 5: Workout Builder (Let Me Pick)
**Goal:** Advanced customization interface

#### Tasks:
- [ ] **Exercise shopping cart**
  - Create cart component (floating or bottom sheet)
  - Add to cart from exercise browser
  - Show cart count
  - View cart contents
  - Remove from cart

- [ ] **Circuit assignment interface**
  - Show workout structure (empty slots)
  - Drag-and-drop exercises into circuit slots (or tap-to-assign)
  - Visual feedback for filled/empty slots
  - Reorder exercises within circuits
  - Swap exercises between circuits
  - Clear/remove individual exercises

- [ ] **User-created exercises**
  - Add "Create Exercise" button in browser
  - Form: Name, Category, Muscle Groups, Difficulty, Instructions
  - Auto-research feature:
    - Use web search API (SerpAPI, Google Custom Search)
    - Parse results for exercise details
    - Prepopulate form fields
    - User confirms/edits
  - Upload custom media (optional, future)
  - Save to user's personal taxonomy

- [ ] **Workout saving**
  - "Save Workout" button
  - Prompt for workout name
  - Optionally add description/notes
  - Save to user's library
  - Confirmation feedback

- [ ] **Workout editing**
  - Edit existing saved workouts
  - Modify structure, exercises, settings
  - Save changes
  - Track workout versions (optional, future)

### Phase 6: Polish & Launch Prep
**Goal:** Refine UX, fix bugs, prepare for MVP launch

#### Tasks:
- [ ] **Workout library screen**
  - Display user's saved workouts
  - Sort by: Recent, Name, Difficulty
  - Filter by objective
  - Search workouts
  - Workout cards showing: name, structure notation, preview exercises
  - Tap to view details
  - Swipe actions: Edit, Delete, Duplicate

- [ ] **User settings**
  - Profile management (name, email, password)
  - Workout preferences (default structure, objectives)
  - Notification settings (workout reminders - future)
  - App settings (sound, vibration, theme)
  - Data export (future)
  - Account deletion

- [ ] **Design system implementation**
  - Define color palette (minimalist, high contrast)
  - Typography scale
  - Spacing system
  - Component library (buttons, inputs, cards, modals)
  - Animations/transitions (subtle, smooth)
  - Loading states
  - Empty states
  - Error states

- [ ] **Home screen**
  - Show "Quick Start" (Jump Right In CTA)
  - Recent workouts section
  - Workout streak or stats (future)
  - Explore curated workouts
  - Access workout library

- [ ] **Performance optimization**
  - Optimize exercise list rendering (virtualized lists)
  - Implement image lazy loading
  - Cache exercise data locally
  - Minimize API calls
  - Optimize bundle size
  - Test on low-end devices

- [ ] **Testing**
  - Unit tests for workout engine, timer, algorithms
  - Integration tests for API endpoints
  - E2E tests for critical flows (create workout, run workout)
  - Manual testing on iOS and Android
  - Test with real exercise data
  - Test timer accuracy
  - Test background behavior

- [ ] **Bug fixes & refinements**
  - Fix all critical bugs
  - Address UI/UX feedback
  - Smooth animations
  - Handle edge cases
  - Improve error messages

- [ ] **Launch preparation**
  - App store assets (screenshots, descriptions, keywords)
  - Privacy policy
  - Terms of service
  - App icons and splash screens
  - Beta testing with friends/family
  - Set up crash reporting (Sentry)
  - Set up analytics (Mixpanel, Amplitude, or PostHog)
  - Production environment setup
  - Database backups
  - Monitoring/alerting

---

## Key Design Decisions

### Workout Structure Flexibility
The app supports any HICT structure via the notation system (NxMxI+RxS):
- N circuits
- M exercises per circuit
- I seconds interval per exercise
- R seconds rest between sets
- S sets per circuit

This allows beginners to start with 1x3x30+60x2 and advanced users to do 5x5x20+30x4.

### Progressive Disclosure
Three entry paths serve different user needs:
1. **Jump Right In:** Zero friction, instant gratification
2. **Let Us Curate:** Guided, smart defaults, minimal input
3. **Take the Wheel:** Full control for power users

Users naturally progress from 1→2→3 as they engage more.

### Exercise Taxonomy Philosophy
- Comprehensive (500+ exercises eventually)
- Structured (hierarchical categories)
- Relational (track variants)
- Extensible (users can add exercises)
- Searchable (multiple filter dimensions)

### Timer Accuracy
Use native modules or Web Workers to ensure timer doesn't drift. Critical for workout experience.

### Media Strategy
Start with existing exercise GIFs (ExerciseDB). Future: professional recordings with proper form demonstration.

---

## Future Enhancements (Post-MVP)

### Phase 7+: Beyond Launch
- [ ] Workout history & analytics (trends, progress tracking)
- [ ] Workout programs (multi-day/week plans)
- [ ] Social features (share workouts, follow friends)
- [ ] Challenges & achievements
- [ ] Apple Watch / Wear OS integration
- [ ] Audio coaching (voice guidance during workouts)
- [ ] Music integration (Spotify/Apple Music)
- [ ] Heart rate monitoring (via watch or phone)
- [ ] Video tutorials (supplementary form content)
- [ ] Community-created workouts (curated marketplace)
- [ ] Personal trainer mode (coach creates workouts for clients)
- [ ] Nutrition tracking integration
- [ ] Equipment tracking (home gym inventory)
- [ ] Workout scheduling & reminders
- [ ] Progressive overload tracking
- [ ] AI workout generation (GPT-4 powered suggestions)
- [ ] Import workouts from other apps/formats
- [ ] Export workouts (PDF, calendar events)
- [ ] Web app version
- [ ] Tablet optimization

---

## Success Metrics (MVP)

### User Engagement
- 70%+ of users complete onboarding
- 50%+ complete at least one workout
- 30%+ create account within first session
- 20%+ return for second workout within 7 days

### Product Quality
- Average workout completion rate >80%
- App crash rate <1%
- Timer accuracy within ±1 second
- Exercise database 500+ exercises
- App store rating >4.0 stars

### Business (Future)
- 1,000 downloads in first month
- 100 weekly active users by month 2
- Foundation for monetization (premium features, no ads in free tier)

---

## Risks & Mitigations

### Technical Risks
- **Timer accuracy issues on mobile:** Use native modules, test extensively
- **Exercise media loading slow:** Implement aggressive caching, low-res thumbnails
- **Database performance with large datasets:** Index properly, paginate queries
- **Background execution limits (iOS):** Use background modes carefully, set expectations

### Product Risks
- **Too complex for beginners:** Jump Right In must be dead simple
- **Too simple for advanced users:** Take the Wheel provides unlimited customization
- **Exercise database incomplete:** Start with quality over quantity, allow user additions
- **Media quality varies:** Curate best GIFs, plan for pro content later

### Business Risks
- **Crowded fitness app market:** Differentiate on HICT focus and simplicity
- **User retention in fitness apps low:** Focus on quick wins, friction-free experience
- **Monetization unclear:** Launch free, validate usage, add premium features later

---

## Checkpoints for Reverting

Throughout development, we'll create checkpoints at the end of each phase. These represent stable states you can revert to if needed.

### Checkpoint Structure
Each checkpoint includes:
- Git commit SHA
- Database snapshot
- Description of state
- What's working at this point

### Created Checkpoints

#### ✅ RESEARCH_COMPLETE (2026-01-08)
**Status:** Complete
**What's Working:**
- Comprehensive research documentation complete
- Exercise library decision made (Free Exercise DB)
- 120+ HICT exercises documented with progressions
- Exercise taxonomy structure defined (7 categories, difficulty levels, tags)
- 9 workout objectives researched and specified
- Complete database schema designed (14 tables)
- Media sourcing strategy defined (Cloudflare R2 + Free Exercise DB)

**Deliverables:**
- `/research/exercise-library-research.md`
- `/research/hict-exercise-research.md`
- `/research/exercise-taxonomy.md`
- `/research/workout-objectives.md`
- `/research/database-schema.md`
- `/research/media-sourcing-strategy.md`

**Next Phase:** Phase 1 - Core Infrastructure

---

#### ✅ INFRASTRUCTURE_READY (2026-01-08)
**Status:** Complete
**What's Working:**
- Backend server running at http://localhost:3000
- PostgreSQL database on Supabase fully configured
- All 14 tables created via Prisma migrations
- Prisma Client generated and working
- Supabase authentication keys configured
- Development environment fully operational
- Prisma Studio running at http://localhost:51212

**Deliverables:**
- Backend server with Express + TypeScript
- Complete `.env` configuration
- Database connection established
- All migrations applied successfully
- Auth system ready for implementation

**Next Phase:** Phase 2 - Exercise Taxonomy System

**Notes:**
- Supabase project: `cfmgxtnnluoyxazxmixw`
- Using pooled connection for better performance
- All services currently running

#### ⏳ TAXONOMY_BUILT
**Status:** Pending
**Target:** Exercise database populated, browsing works
**Deliverables TBD**

#### ⏳ ENGINE_FUNCTIONAL
**Status:** Pending
**Target:** Workouts can be created and run end-to-end
**Deliverables TBD**

#### ⏳ ONBOARDING_COMPLETE
**Status:** Pending
**Target:** All three entry flows working
**Deliverables TBD**

#### ⏳ BUILDER_COMPLETE
**Status:** Pending
**Target:** Custom workout builder functional
**Deliverables TBD**

#### ⏳ MVP_LAUNCH_READY
**Status:** Pending
**Target:** Polished, tested, ready for app stores
**Deliverables TBD**

---

## Development Philosophy

### Build Fast, Iterate
- Start with minimal viable features
- Get working software quickly
- Test with real workouts
- Gather feedback, improve

### Mobile-First, Always
- Every decision considers mobile constraints
- Touch targets, readability, performance
- Works offline (future: cache workouts)

### Simplicity Over Features
- When in doubt, remove complexity
- Every feature must justify its existence
- Onboarding should take <60 seconds

### Quality Exercise Content
- Better to have 300 great exercises than 1000 mediocre ones
- Accurate form demonstrations are non-negotiable
- Taxonomy must make sense to real users

---

## Next Steps

1. **Review and approve this project plan**
2. **Confirm technical stack choices** (or propose alternatives)
3. **Set up development environment** (Phase 1, Task 1)
4. **Begin Phase 0 research** (parallel to infrastructure setup)

Let's build something awesome! 💪

---

*Last Updated: 2026-01-08*
*Version: 1.0*
