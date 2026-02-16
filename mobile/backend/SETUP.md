# Intensely Backend Setup Guide

## Phase 1 Progress - ALMOST COMPLETE!

### ✅ What's Been Done

1. **React Native Mobile App** (`/mobile`)
   - Expo + TypeScript project initialized
   - Ready for development

2. **Node.js Backend** (`/backend`)
   - Express server with TypeScript
   - Project structure created (routes, controllers, services, middleware)
   - Health check endpoint working at http://localhost:3000/health
   - Development server running with hot reload

3. **Database Schema** (`/backend/prisma/schema.prisma`)
   - Complete Prisma schema implemented (14 models)
   - Based on our comprehensive research
   - Users, Exercises, Workouts, Objectives, Progress tracking

4. **Configuration Files**
   - TypeScript configured
   - Environment variables set up (.env)
   - Package scripts ready (dev, build, prisma commands)

---

## Next Steps: Database & Auth Setup

### Option 1: Supabase (RECOMMENDED)

Supabase provides PostgreSQL + Authentication + Storage in one free service.

#### Steps:

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Click "Start your project"
   # Create a new project (free tier)
   ```

2. **Get Database URL**
   - In Supabase dashboard: Settings → Database
   - Copy "Connection string" (URI mode)
   - Update `.env` file:
   ```
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres"
   ```

3. **Run Prisma Migrations**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

4. **Configure Supabase Auth**
   - In `.env`, add:
   ```
   SUPABASE_URL=https://[PROJECT-REF].supabase.co
   SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_KEY=[your-service-key]
   ```

5. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

---

### Option 2: Local PostgreSQL with Docker

If you prefer local development:

1. **Start PostgreSQL Container**
   ```bash
   docker run --name intensely-postgres \
     -e POSTGRES_PASSWORD=password \
     -e POSTGRES_DB=intensely \
     -p 5432:5432 \
     -d postgres:16
   ```

2. **Update .env**
   ```
   DATABASE_URL="postgresql://postgres:password@localhost:5432/intensely"
   ```

3. **Run Migrations**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   npx prisma generate
   ```

---

## After Database Setup

### 1. Seed Initial Data

We need to seed:
- 9 Workout Objectives
- 7 Exercise Families
- 200+ Exercises from Free Exercise DB

Create `/backend/prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Seed workout objectives
  await prisma.workoutObjective.createMany({
    data: [
      {
        name: 'Fat Burn & Weight Loss',
        slug: 'fat-burn-weight-loss',
        description: 'Maximize calorie expenditure with high-intensity movements',
        tagline: 'Torch calories fast',
        // ... more fields
      },
      // ... 8 more objectives
    ]
  });

  // Seed exercise families
  // Seed exercises
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run seed:
```bash
npm run prisma:seed
```

### 2. Build API Endpoints

Create REST API for:
- `/api/exercises` - Browse exercises
- `/api/objectives` - Get workout objectives
- `/api/workouts` - CRUD workouts
- `/api/auth` - Authentication

### 3. Connect Mobile App

Install dependencies in mobile app:
```bash
cd ../mobile
npm install @supabase/supabase-js axios react-query
```

---

## Development Commands

### Backend
```bash
cd backend

# Start dev server (already running!)
npm run dev

# Build for production
npm run build

# Run migrations
npm run prisma:migrate

# Open Prisma Studio (database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

### Mobile
```bash
cd mobile

# Start Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

---

## Current Architecture

```
intensely/
├── mobile/                 # React Native + Expo app
│   ├── App.tsx
│   ├── assets/
│   └── package.json
│
├── backend/                # Node.js + Express API
│   ├── src/
│   │   ├── index.ts       # Main server file ✅
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # Business logic
│   │   ├── middleware/    # Auth, validation, etc.
│   │   └── types/         # TypeScript types
│   │
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema ✅
│   │   └── seed.ts        # Seed data (TODO)
│   │
│   ├── .env               # Environment variables ✅
│   ├── tsconfig.json      # TypeScript config ✅
│   └── package.json       # Dependencies ✅
│
└── research/              # Phase 0 research docs ✅
    ├── exercise-library-research.md
    ├── hict-exercise-research.md
    ├── exercise-taxonomy.md
    ├── workout-objectives.md
    ├── database-schema.md
    └── media-sourcing-strategy.md
```

---

## What's Next (Phase 1 Completion)

1. ✅ React Native app initialized
2. ✅ Backend server running
3. ✅ Database schema created
4. ⏳ **Set up Supabase** (or Docker PostgreSQL)
5. ⏳ **Run migrations** (create tables)
6. ⏳ **Seed initial data** (objectives, families)
7. ⏳ **Build basic API** (exercises, objectives endpoints)
8. ⏳ **Test API** with Postman/curl

After this, Phase 2 begins: Exercise Taxonomy System

---

## Need Help?

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **Expo Docs**: https://docs.expo.dev
- **Express Docs**: https://expressjs.com

---

*Last Updated: 2026-01-08*
*Phase 1: Core Infrastructure - 80% Complete*
