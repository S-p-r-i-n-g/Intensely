-- SimplifyUserPreferences
-- Remove deprecated fields and add warm up / cool down fields

-- Remove deprecated columns
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "default_objective_id";
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "default_difficulty";
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "default_exercises_per_circuit";
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "available_equipment";
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "small_space";
ALTER TABLE "user_preferences" DROP COLUMN IF EXISTS "quiet_mode";

-- Add new columns
ALTER TABLE "user_preferences" ADD COLUMN "default_warm_up_seconds" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_preferences" ADD COLUMN "default_cool_down_seconds" INTEGER NOT NULL DEFAULT 0;

-- Update default for default_interval_seconds from 20 to 30
ALTER TABLE "user_preferences" ALTER COLUMN "default_interval_seconds" SET DEFAULT 30;
