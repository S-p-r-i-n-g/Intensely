-- Enable Row Level Security on all tables
-- This migration addresses Supabase security linter errors

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================

ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_preferences" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercise_families" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_objectives" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workouts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "circuits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "circuit_exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_history" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "workout_objective_mappings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_exercise_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favorite_exercises" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "favorite_workouts" ENABLE ROW LEVEL SECURITY;

-- Note: _prisma_migrations table is handled separately below

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON "users"
  FOR SELECT
  USING (auth.uid()::text = id);

-- Users can update their own data
CREATE POLICY "Users can update own profile"
  ON "users"
  FOR UPDATE
  USING (auth.uid()::text = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Users can create own profile"
  ON "users"
  FOR INSERT
  WITH CHECK (auth.uid()::text = id);

-- ============================================================================
-- USER PREFERENCES POLICIES
-- ============================================================================

-- Users can view their own preferences
CREATE POLICY "Users can view own preferences"
  ON "user_preferences"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can create their own preferences
CREATE POLICY "Users can create own preferences"
  ON "user_preferences"
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON "user_preferences"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own preferences
CREATE POLICY "Users can delete own preferences"
  ON "user_preferences"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- EXERCISE FAMILIES POLICIES
-- ============================================================================

-- Everyone can read exercise families (public reference data)
CREATE POLICY "Anyone can view exercise families"
  ON "exercise_families"
  FOR SELECT
  USING (true);

-- Only authenticated users can create exercise families
-- (In production, you may want to restrict this to admins)
CREATE POLICY "Authenticated users can create exercise families"
  ON "exercise_families"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- EXERCISES POLICIES
-- ============================================================================

-- Everyone can read verified exercises
CREATE POLICY "Anyone can view verified exercises"
  ON "exercises"
  FOR SELECT
  USING (is_verified = true AND deleted_at IS NULL);

-- Users can read their own created exercises (even unverified)
CREATE POLICY "Users can view own exercises"
  ON "exercises"
  FOR SELECT
  USING (auth.uid()::text = created_by);

-- Authenticated users can create exercises
CREATE POLICY "Authenticated users can create exercises"
  ON "exercises"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by);

-- Users can update their own exercises
CREATE POLICY "Users can update own exercises"
  ON "exercises"
  FOR UPDATE
  USING (auth.uid()::text = created_by);

-- Users can delete their own exercises
CREATE POLICY "Users can delete own exercises"
  ON "exercises"
  FOR DELETE
  USING (auth.uid()::text = created_by);

-- ============================================================================
-- WORKOUT OBJECTIVES POLICIES
-- ============================================================================

-- Everyone can read active workout objectives
CREATE POLICY "Anyone can view active workout objectives"
  ON "workout_objectives"
  FOR SELECT
  USING (is_active = true);

-- Only authenticated users can create workout objectives
-- (In production, you may want to restrict this to admins)
CREATE POLICY "Authenticated users can create workout objectives"
  ON "workout_objectives"
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- WORKOUTS POLICIES
-- ============================================================================

-- Anyone can read public workouts
CREATE POLICY "Anyone can view public workouts"
  ON "workouts"
  FOR SELECT
  USING (is_public = true AND deleted_at IS NULL);

-- Users can read their own workouts
CREATE POLICY "Users can view own workouts"
  ON "workouts"
  FOR SELECT
  USING (auth.uid()::text = created_by);

-- Authenticated users can create workouts
CREATE POLICY "Authenticated users can create workouts"
  ON "workouts"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by);

-- Users can update their own workouts
CREATE POLICY "Users can update own workouts"
  ON "workouts"
  FOR UPDATE
  USING (auth.uid()::text = created_by);

-- Users can delete their own workouts
CREATE POLICY "Users can delete own workouts"
  ON "workouts"
  FOR DELETE
  USING (auth.uid()::text = created_by);

-- ============================================================================
-- CIRCUITS POLICIES
-- ============================================================================

-- Users can read circuits from public workouts
CREATE POLICY "Anyone can view circuits from public workouts"
  ON "circuits"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "circuits".workout_id
      AND "workouts".is_public = true
      AND "workouts".deleted_at IS NULL
    )
  );

-- Users can read circuits from their own workouts
CREATE POLICY "Users can view circuits from own workouts"
  ON "circuits"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "circuits".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can create circuits in their own workouts
CREATE POLICY "Users can create circuits in own workouts"
  ON "circuits"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "circuits".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can update circuits in their own workouts
CREATE POLICY "Users can update circuits in own workouts"
  ON "circuits"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "circuits".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can delete circuits in their own workouts
CREATE POLICY "Users can delete circuits in own workouts"
  ON "circuits"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "circuits".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- ============================================================================
-- CIRCUIT EXERCISES POLICIES
-- ============================================================================

-- Users can read circuit exercises from public workouts
CREATE POLICY "Anyone can view circuit exercises from public workouts"
  ON "circuit_exercises"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "circuits"
      JOIN "workouts" ON "workouts".id = "circuits".workout_id
      WHERE "circuits".id = "circuit_exercises".circuit_id
      AND "workouts".is_public = true
      AND "workouts".deleted_at IS NULL
    )
  );

-- Users can read circuit exercises from their own workouts
CREATE POLICY "Users can view circuit exercises from own workouts"
  ON "circuit_exercises"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "circuits"
      JOIN "workouts" ON "workouts".id = "circuits".workout_id
      WHERE "circuits".id = "circuit_exercises".circuit_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can create circuit exercises in their own workouts
CREATE POLICY "Users can create circuit exercises in own workouts"
  ON "circuit_exercises"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "circuits"
      JOIN "workouts" ON "workouts".id = "circuits".workout_id
      WHERE "circuits".id = "circuit_exercises".circuit_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can update circuit exercises in their own workouts
CREATE POLICY "Users can update circuit exercises in own workouts"
  ON "circuit_exercises"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "circuits"
      JOIN "workouts" ON "workouts".id = "circuits".workout_id
      WHERE "circuits".id = "circuit_exercises".circuit_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can delete circuit exercises in their own workouts
CREATE POLICY "Users can delete circuit exercises in own workouts"
  ON "circuit_exercises"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "circuits"
      JOIN "workouts" ON "workouts".id = "circuits".workout_id
      WHERE "circuits".id = "circuit_exercises".circuit_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- ============================================================================
-- WORKOUT HISTORY POLICIES
-- ============================================================================

-- Users can only read their own workout history
CREATE POLICY "Users can view own workout history"
  ON "workout_history"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can create their own workout history
CREATE POLICY "Users can create own workout history"
  ON "workout_history"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own workout history
CREATE POLICY "Users can update own workout history"
  ON "workout_history"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own workout history
CREATE POLICY "Users can delete own workout history"
  ON "workout_history"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- WORKOUT OBJECTIVE MAPPINGS POLICIES
-- ============================================================================

-- Users can read mappings for public workouts
CREATE POLICY "Anyone can view mappings for public workouts"
  ON "workout_objective_mappings"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "workout_objective_mappings".workout_id
      AND "workouts".is_public = true
      AND "workouts".deleted_at IS NULL
    )
  );

-- Users can read mappings for their own workouts
CREATE POLICY "Users can view mappings for own workouts"
  ON "workout_objective_mappings"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "workout_objective_mappings".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can create mappings for their own workouts
CREATE POLICY "Users can create mappings for own workouts"
  ON "workout_objective_mappings"
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "workout_objective_mappings".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can update mappings for their own workouts
CREATE POLICY "Users can update mappings for own workouts"
  ON "workout_objective_mappings"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "workout_objective_mappings".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- Users can delete mappings for their own workouts
CREATE POLICY "Users can delete mappings for own workouts"
  ON "workout_objective_mappings"
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM "workouts"
      WHERE "workouts".id = "workout_objective_mappings".workout_id
      AND "workouts".created_by = auth.uid()::text
    )
  );

-- ============================================================================
-- USER EXERCISE PROGRESS POLICIES
-- ============================================================================

-- Users can only read their own progress
CREATE POLICY "Users can view own exercise progress"
  ON "user_exercise_progress"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can create their own progress records
CREATE POLICY "Users can create own exercise progress"
  ON "user_exercise_progress"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own exercise progress"
  ON "user_exercise_progress"
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own exercise progress"
  ON "user_exercise_progress"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- FAVORITE EXERCISES POLICIES
-- ============================================================================

-- Users can only read their own favorites
CREATE POLICY "Users can view own favorite exercises"
  ON "favorite_exercises"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can create own favorite exercises"
  ON "favorite_exercises"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete own favorite exercises"
  ON "favorite_exercises"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- FAVORITE WORKOUTS POLICIES
-- ============================================================================

-- Users can only read their own favorites
CREATE POLICY "Users can view own favorite workouts"
  ON "favorite_workouts"
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can add their own favorites
CREATE POLICY "Users can create own favorite workouts"
  ON "favorite_workouts"
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Users can remove their own favorites
CREATE POLICY "Users can delete own favorite workouts"
  ON "favorite_workouts"
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================================
-- PRISMA MIGRATIONS TABLE
-- ============================================================================

-- Enable RLS on Prisma migrations table but allow service role access
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

-- Allow the service role to manage migrations (Prisma needs this)
CREATE POLICY "Service role can manage migrations"
  ON "_prisma_migrations"
  FOR ALL
  USING (true);
