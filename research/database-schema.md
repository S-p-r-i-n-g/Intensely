# Database Schema Design
## Intensely HICT Workout App | Version 1.0 | 2026-01-08

---

## Overview

PostgreSQL database schema for Intensely, designed to support:
- Comprehensive exercise taxonomy
- Flexible workout structures (NxMxI+RxS notation)
- User authentication and preferences
- Workout history and progress tracking
- User-generated content

**ORM:** Prisma or Drizzle ORM recommended for type-safe database access.

---

## Schema Diagram (High-Level)

```
Users
  ├─→ UserPreferences
  ├─→ Workouts (created_by)
  ├─→ WorkoutHistory
  └─→ UserExercises (custom exercises)

Exercises
  ├─→ ExerciseFamilies (belongs_to)
  ├─→ ExerciseVariants (siblings)
  └─→ Media (images, gifs, videos)

Workouts
  ├─→ Circuits
  └─→ WorkoutObjectives (many-to-many)

Circuits
  └─→ CircuitExercises (junction)

WorkoutObjectives
  └─→ ObjectivePreferences
```

---

## Core Tables

### 1. users

Stores user accounts and authentication details.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- NULL for social auth
  first_name VARCHAR(100),
  last_name VARCHAR(100),

  -- Authentication
  auth_provider VARCHAR(50) DEFAULT 'email', -- 'email', 'google', 'apple'
  auth_provider_id VARCHAR(255), -- ID from OAuth provider
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,

  -- Profile
  avatar_url VARCHAR(500),
  date_of_birth DATE,
  gender VARCHAR(20), -- 'male', 'female', 'non-binary', 'prefer-not-to-say'

  -- Fitness Profile
  fitness_level VARCHAR(20) DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),

  -- Settings
  metric_system BOOLEAN DEFAULT TRUE, -- true = metric, false = imperial
  notification_preferences JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,

  -- Soft delete
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_auth_provider ON users(auth_provider, auth_provider_id);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

---

### 2. user_preferences

Stores user workout preferences and defaults.

```sql
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Default Workout Preferences
  default_objective_id UUID REFERENCES workout_objectives(id),
  default_difficulty VARCHAR(20) DEFAULT 'intermediate',

  -- Default Workout Structure
  default_circuits INTEGER DEFAULT 3,
  default_exercises_per_circuit INTEGER DEFAULT 3,
  default_interval_seconds INTEGER DEFAULT 20,
  default_rest_seconds INTEGER DEFAULT 60,
  default_sets INTEGER DEFAULT 3,

  -- Equipment Availability
  available_equipment JSONB DEFAULT '["bodyweight"]', -- ['bodyweight', 'pull-up-bar', 'chair', etc.]

  -- Environment Constraints
  small_space BOOLEAN DEFAULT FALSE,
  quiet_mode BOOLEAN DEFAULT FALSE, -- apartment-friendly

  -- Workout Settings
  sound_enabled BOOLEAN DEFAULT TRUE,
  vibration_enabled BOOLEAN DEFAULT TRUE,
  voice_coaching BOOLEAN DEFAULT FALSE, -- future feature

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id)
);

CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

---

### 3. exercise_families

Groups related exercises into families (e.g., Squat Family, Push-up Family).

```sql
CREATE TABLE exercise_families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL, -- 'Squat', 'Push-up', 'Plank'
  slug VARCHAR(100) UNIQUE NOT NULL, -- 'squat', 'push-up', 'plank'
  description TEXT,

  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_families_slug ON exercise_families(slug);
```

---

### 4. exercises

The authoritative exercise database implementing the taxonomy.

```sql
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  family_id UUID REFERENCES exercise_families(id) ON DELETE SET NULL,

  -- Taxonomy
  primary_category VARCHAR(50) NOT NULL, -- 'upper_body_push', 'lower_body', 'core', etc.
  difficulty VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'

  -- Muscles
  primary_muscles JSONB NOT NULL DEFAULT '[]', -- ['chest', 'triceps']
  secondary_muscles JSONB DEFAULT '[]', -- ['shoulders', 'core']

  -- Movement Classification
  movement_pattern VARCHAR(50), -- 'push_horizontal', 'pull_vertical', 'squat', etc.
  force_type VARCHAR(20), -- 'push', 'pull', 'static'
  mechanic VARCHAR(20), -- 'compound', 'isolation'

  -- Equipment
  equipment JSONB NOT NULL DEFAULT '["bodyweight"]', -- ['bodyweight', 'pull-up-bar', 'chair']

  -- Tags (boolean flags)
  hict_suitable BOOLEAN DEFAULT TRUE,
  small_space BOOLEAN DEFAULT TRUE,
  quiet BOOLEAN DEFAULT TRUE,
  cardio_intensive BOOLEAN DEFAULT FALSE,
  strength_focus BOOLEAN DEFAULT FALSE,
  mobility_focus BOOLEAN DEFAULT FALSE,
  beginner_friendly BOOLEAN DEFAULT FALSE,
  minimal_transition BOOLEAN DEFAULT TRUE,

  -- Content
  description TEXT,
  instructions JSONB NOT NULL, -- ['Step 1', 'Step 2', 'Step 3']
  tips JSONB DEFAULT '[]', -- ['Keep core tight', 'Don't lock elbows']
  common_mistakes JSONB DEFAULT '[]', -- ['Sagging hips', 'Flared elbows']
  breathing TEXT, -- 'Exhale on exertion, inhale on return'

  -- Media
  thumbnail_url VARCHAR(500),
  gif_url VARCHAR(500),
  video_url VARCHAR(500),
  images JSONB DEFAULT '[]', -- ['url1', 'url2']

  -- Metrics
  default_reps INTEGER DEFAULT 10,
  default_duration_seconds INTEGER DEFAULT 30,
  calories_per_minute DECIMAL(5,2), -- estimated calories burned per minute
  met_value DECIMAL(4,2), -- Metabolic Equivalent of Task

  -- Metadata
  created_by UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL = system, UUID = user-created
  is_verified BOOLEAN DEFAULT FALSE, -- verified by admin
  popularity_score INTEGER DEFAULT 0, -- how often used in workouts

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_exercises_slug ON exercises(slug);
CREATE INDEX idx_exercises_primary_category ON exercises(primary_category);
CREATE INDEX idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX idx_exercises_family_id ON exercises(family_id);
CREATE INDEX idx_exercises_created_by ON exercises(created_by);
CREATE INDEX idx_exercises_is_verified ON exercises(is_verified);
CREATE INDEX idx_exercises_deleted_at ON exercises(deleted_at);

-- GIN index for JSONB columns for efficient filtering
CREATE INDEX idx_exercises_primary_muscles ON exercises USING GIN (primary_muscles);
CREATE INDEX idx_exercises_equipment ON exercises USING GIN (equipment);
```

---

### 5. workout_objectives

The 9 workout objectives with preferences and recommendations.

```sql
CREATE TABLE workout_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE, -- 'Fat Burn & Weight Loss'
  slug VARCHAR(100) UNIQUE NOT NULL, -- 'fat-burn-weight-loss'
  description TEXT NOT NULL, -- User-facing description
  tagline VARCHAR(200), -- Short marketing copy

  -- Objective Preferences
  preferred_categories JSONB NOT NULL, -- { high: [], medium: [], low: [] }
  intensity_percentage INTEGER, -- 80 = 80% max HR

  -- Recommended Workout Structure
  recommended_circuits INTEGER DEFAULT 3,
  recommended_exercises_per_circuit INTEGER DEFAULT 3,
  recommended_interval_seconds INTEGER DEFAULT 20,
  recommended_rest_seconds INTEGER DEFAULT 60,
  recommended_sets INTEGER DEFAULT 3,
  recommended_duration_minutes INTEGER DEFAULT 20,

  -- Display
  icon_url VARCHAR(500),
  color_hex VARCHAR(7), -- #FF5733
  display_order INTEGER DEFAULT 0,

  -- Metadata
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_objectives_slug ON workout_objectives(slug);
CREATE INDEX idx_workout_objectives_display_order ON workout_objectives(display_order);
```

---

### 6. workouts

User-created or system-curated workout plans.

```sql
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200), -- nullable for user workouts
  description TEXT,

  -- Ownership
  created_by UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = system workout
  is_public BOOLEAN DEFAULT FALSE, -- can other users see/copy?
  is_template BOOLEAN DEFAULT FALSE, -- system template workout

  -- Workout Structure
  total_circuits INTEGER NOT NULL,
  exercises_per_circuit INTEGER NOT NULL,
  interval_seconds INTEGER NOT NULL,
  rest_seconds INTEGER NOT NULL,
  sets_per_circuit INTEGER NOT NULL,

  -- Computed fields
  estimated_duration_minutes INTEGER, -- calculated from structure
  estimated_calories DECIMAL(6,2), -- estimated total calories
  difficulty_level VARCHAR(20), -- 'beginner', 'intermediate', 'advanced'

  -- Tags
  equipment_required JSONB DEFAULT '["bodyweight"]',
  primary_objective_id UUID REFERENCES workout_objectives(id),

  -- Metrics
  times_completed INTEGER DEFAULT 0, -- how many times completed by users
  average_rating DECIMAL(3,2), -- future: user ratings

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP -- soft delete
);

CREATE INDEX idx_workouts_created_by ON workouts(created_by);
CREATE INDEX idx_workouts_is_template ON workouts(is_template);
CREATE INDEX idx_workouts_is_public ON workouts(is_public);
CREATE INDEX idx_workouts_primary_objective_id ON workouts(primary_objective_id);
CREATE INDEX idx_workouts_difficulty_level ON workouts(difficulty_level);
CREATE INDEX idx_workouts_deleted_at ON workouts(deleted_at);
```

---

### 7. circuits

Individual circuits within a workout.

```sql
CREATE TABLE circuits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  circuit_order INTEGER NOT NULL, -- 1, 2, 3

  -- Optional circuit-specific overrides
  interval_seconds INTEGER, -- override workout default
  rest_seconds INTEGER, -- override workout default
  sets INTEGER, -- override workout default

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(workout_id, circuit_order)
);

CREATE INDEX idx_circuits_workout_id ON circuits(workout_id);
CREATE INDEX idx_circuits_circuit_order ON circuits(circuit_order);
```

---

### 8. circuit_exercises

Junction table linking exercises to circuits.

```sql
CREATE TABLE circuit_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  circuit_id UUID NOT NULL REFERENCES circuits(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  exercise_order INTEGER NOT NULL, -- 1, 2, 3 within the circuit

  -- Optional exercise-specific overrides
  reps INTEGER, -- override for rep-based exercises
  duration_seconds INTEGER, -- override for time-based exercises

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(circuit_id, exercise_order)
);

CREATE INDEX idx_circuit_exercises_circuit_id ON circuit_exercises(circuit_id);
CREATE INDEX idx_circuit_exercises_exercise_id ON circuit_exercises(exercise_id);
```

---

### 9. workout_history

Tracks completed workouts for progress tracking.

```sql
CREATE TABLE workout_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL, -- NULL if workout deleted

  -- Workout Snapshot (in case workout is modified/deleted)
  workout_snapshot JSONB NOT NULL, -- complete workout structure at time of completion

  -- Completion Details
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_seconds INTEGER, -- actual duration

  -- Performance
  circuits_completed INTEGER,
  total_exercises_completed INTEGER,
  completion_percentage DECIMAL(5,2), -- 100.00 = fully completed

  -- Metrics
  estimated_calories_burned DECIMAL(6,2),
  average_heart_rate INTEGER, -- future: if watch integration
  max_heart_rate INTEGER, -- future

  -- User Feedback
  perceived_difficulty INTEGER, -- 1-10 scale
  user_rating INTEGER, -- 1-5 stars
  notes TEXT, -- user's notes about the workout

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_workout_history_user_id ON workout_history(user_id);
CREATE INDEX idx_workout_history_workout_id ON workout_history(workout_id);
CREATE INDEX idx_workout_history_completed_at ON workout_history(completed_at);
CREATE INDEX idx_workout_history_started_at ON workout_history(started_at);
```

---

### 10. workout_objective_mappings

Many-to-many relationship between workouts and objectives.

```sql
CREATE TABLE workout_objective_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  objective_id UUID NOT NULL REFERENCES workout_objectives(id) ON DELETE CASCADE,
  relevance_score INTEGER DEFAULT 100, -- 0-100 how well workout matches objective

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(workout_id, objective_id)
);

CREATE INDEX idx_workout_objective_mappings_workout_id ON workout_objective_mappings(workout_id);
CREATE INDEX idx_workout_objective_mappings_objective_id ON workout_objective_mappings(objective_id);
```

---

## Utility Tables

### 11. exercise_media

Separate table for exercise media for easier management (future expansion).

```sql
CREATE TABLE exercise_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

  media_type VARCHAR(20) NOT NULL, -- 'image', 'gif', 'video'
  media_url VARCHAR(500) NOT NULL,
  media_resolution VARCHAR(20), -- '360p', '720p', '1080p'
  media_size_bytes BIGINT,

  is_primary BOOLEAN DEFAULT FALSE, -- primary thumbnail
  display_order INTEGER DEFAULT 0,

  -- Licensing (if needed)
  license VARCHAR(100),
  license_author VARCHAR(200),
  source_url VARCHAR(500),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercise_media_exercise_id ON exercise_media(exercise_id);
CREATE INDEX idx_exercise_media_media_type ON exercise_media(media_type);
CREATE INDEX idx_exercise_media_is_primary ON exercise_media(is_primary);
```

---

### 12. user_exercise_progress

Track user's progress on individual exercises (future feature).

```sql
CREATE TABLE user_exercise_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

  -- Personal Bests
  max_reps INTEGER,
  max_duration_seconds INTEGER,
  max_weight_kg DECIMAL(5,2), -- future: weighted exercises

  -- Last Performance
  last_performed_at TIMESTAMP,
  last_reps INTEGER,
  last_duration_seconds INTEGER,

  -- Statistics
  times_performed INTEGER DEFAULT 0,

  -- User Notes
  notes TEXT,
  difficulty_rating INTEGER, -- 1-10 personal difficulty

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_user_exercise_progress_user_id ON user_exercise_progress(user_id);
CREATE INDEX idx_user_exercise_progress_exercise_id ON user_exercise_progress(exercise_id);
```

---

### 13. favorite_exercises

User's favorited exercises for quick access.

```sql
CREATE TABLE favorite_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, exercise_id)
);

CREATE INDEX idx_favorite_exercises_user_id ON favorite_exercises(user_id);
CREATE INDEX idx_favorite_exercises_exercise_id ON favorite_exercises(exercise_id);
```

---

### 14. favorite_workouts

User's favorited workouts.

```sql
CREATE TABLE favorite_workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(user_id, workout_id)
);

CREATE INDEX idx_favorite_workouts_user_id ON favorite_workouts(user_id);
CREATE INDEX idx_favorite_workouts_workout_id ON favorite_workouts(workout_id);
```

---

## Seed Data Requirements

### Initial Data to Seed

1. **workout_objectives** (9 objectives)
   - Fat Burn & Weight Loss
   - Muscle Endurance
   - Cardiovascular Conditioning
   - Strength Building
   - Core Stability
   - Functional Fitness
   - Athletic Performance
   - Flexibility & Mobility
   - Full Body Conditioning

2. **exercise_families** (7 major families)
   - Squat Family
   - Push-up Family
   - Plank Family
   - Lunge Family
   - Pull-up Family
   - Burpee Family
   - Leg Raise Family

3. **exercises** (200+ exercises)
   - Import from Free Exercise DB
   - Add missing HICT exercises
   - Properly taxonomized

---

## Database Migrations Strategy

### Migration 1: Initial Schema
Create all tables with basic structure.

### Migration 2: Seed Objectives
Insert 9 workout objectives.

### Migration 3: Seed Exercise Families
Insert 7 exercise families.

### Migration 4: Import Exercises
Import and transform Free Exercise DB data.

### Migration 5: Create System Workouts
Create curated workout templates for each objective.

---

## Queries & Performance

### Common Queries

#### 1. Get All Exercises for a Category and Difficulty
```sql
SELECT * FROM exercises
WHERE primary_category = 'upper_body_push'
AND difficulty = 'beginner'
AND deleted_at IS NULL
AND hict_suitable = TRUE
ORDER BY popularity_score DESC;
```

#### 2. Get Workout with All Circuits and Exercises
```sql
SELECT
  w.*,
  c.id AS circuit_id,
  c.circuit_order,
  ce.exercise_order,
  e.*
FROM workouts w
JOIN circuits c ON w.id = c.workout_id
JOIN circuit_exercises ce ON c.id = ce.circuit_id
JOIN exercises e ON ce.exercise_id = e.id
WHERE w.id = $1
AND w.deleted_at IS NULL
ORDER BY c.circuit_order, ce.exercise_order;
```

#### 3. Get User's Workout History
```sql
SELECT
  wh.*,
  w.name AS workout_name
FROM workout_history wh
LEFT JOIN workouts w ON wh.workout_id = w.id
WHERE wh.user_id = $1
ORDER BY wh.completed_at DESC
LIMIT 20;
```

#### 4. Find Exercises Matching User Preferences
```sql
SELECT e.* FROM exercises e
JOIN user_preferences up ON TRUE
WHERE up.user_id = $1
AND e.difficulty = up.default_difficulty
AND e.equipment <@ up.available_equipment -- all exercise equipment available to user
AND (NOT up.small_space OR e.small_space = TRUE)
AND (NOT up.quiet_mode OR e.quiet = TRUE)
AND e.deleted_at IS NULL
ORDER BY e.popularity_score DESC;
```

---

## Backup & Maintenance

### Regular Backups
- **Daily**: Automated backup of entire database
- **Weekly**: Export user data for disaster recovery
- **Monthly**: Full backup with retention

### Maintenance Tasks
- **Weekly**: VACUUM and ANALYZE for performance
- **Monthly**: Review and archive old workout_history (>1 year)
- **Quarterly**: Review unused exercises (low popularity_score)

---

## Security Considerations

### Row-Level Security (RLS)
Consider implementing RLS for:
- Users can only see their own data
- Public workouts visible to all
- Admin-only access to system templates

### Data Encryption
- Password hashes using bcrypt (cost factor 12+)
- Consider encryption at rest for sensitive user data
- TLS for all database connections

---

## Scaling Considerations

### Indexing
- All foreign keys indexed
- Frequently filtered columns indexed
- GIN indexes for JSONB columns

### Partitioning (Future)
- Partition `workout_history` by year for performance
- Archive old data to cold storage

### Caching
- Cache frequently accessed exercises
- Cache workout templates
- Cache user preferences

---

## Next Steps

1. ✅ Schema designed
2. ⏭️ Implement with Prisma/Drizzle ORM
3. ⏭️ Create migration files
4. ⏭️ Seed workout objectives
5. ⏭️ Import Free Exercise DB
6. ⏭️ Create API endpoints

---

*Version 1.0 | Created: 2026-01-08*
*Total Tables: 14 core + utility tables*
*Estimated Size: 200+ exercises, 9 objectives, unlimited user workouts*
