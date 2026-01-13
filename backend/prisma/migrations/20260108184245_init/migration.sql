-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "auth_provider" TEXT NOT NULL DEFAULT 'email',
    "auth_provider_id" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "avatar_url" TEXT,
    "date_of_birth" DATE,
    "gender" TEXT,
    "fitness_level" TEXT NOT NULL DEFAULT 'beginner',
    "height_cm" INTEGER,
    "weight_kg" DECIMAL(5,2),
    "metric_system" BOOLEAN NOT NULL DEFAULT true,
    "notification_preferences" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "default_objective_id" TEXT,
    "default_difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "default_circuits" INTEGER NOT NULL DEFAULT 3,
    "default_exercises_per_circuit" INTEGER NOT NULL DEFAULT 3,
    "default_interval_seconds" INTEGER NOT NULL DEFAULT 20,
    "default_rest_seconds" INTEGER NOT NULL DEFAULT 60,
    "default_sets" INTEGER NOT NULL DEFAULT 3,
    "available_equipment" JSONB NOT NULL DEFAULT '["bodyweight"]',
    "small_space" BOOLEAN NOT NULL DEFAULT false,
    "quiet_mode" BOOLEAN NOT NULL DEFAULT false,
    "sound_enabled" BOOLEAN NOT NULL DEFAULT true,
    "vibration_enabled" BOOLEAN NOT NULL DEFAULT true,
    "voice_coaching" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_families" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_families_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "family_id" TEXT,
    "primary_category" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "primary_muscles" JSONB NOT NULL,
    "secondary_muscles" JSONB NOT NULL DEFAULT '[]',
    "movement_pattern" TEXT,
    "force_type" TEXT,
    "mechanic" TEXT,
    "equipment" JSONB NOT NULL DEFAULT '["bodyweight"]',
    "hict_suitable" BOOLEAN NOT NULL DEFAULT true,
    "small_space" BOOLEAN NOT NULL DEFAULT true,
    "quiet" BOOLEAN NOT NULL DEFAULT true,
    "cardio_intensive" BOOLEAN NOT NULL DEFAULT false,
    "strength_focus" BOOLEAN NOT NULL DEFAULT false,
    "mobility_focus" BOOLEAN NOT NULL DEFAULT false,
    "beginner_friendly" BOOLEAN NOT NULL DEFAULT false,
    "minimal_transition" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "instructions" JSONB NOT NULL,
    "tips" JSONB NOT NULL DEFAULT '[]',
    "common_mistakes" JSONB NOT NULL DEFAULT '[]',
    "breathing" TEXT,
    "thumbnail_url" TEXT,
    "gif_url" TEXT,
    "video_url" TEXT,
    "images" JSONB NOT NULL DEFAULT '[]',
    "default_reps" INTEGER,
    "default_duration_seconds" INTEGER,
    "calories_per_minute" DECIMAL(5,2),
    "met_value" DECIMAL(4,2),
    "created_by" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "popularity_score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_objectives" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tagline" TEXT,
    "preferred_categories" JSONB NOT NULL,
    "intensity_percentage" INTEGER,
    "recommended_circuits" INTEGER NOT NULL DEFAULT 3,
    "recommended_exercises_per_circuit" INTEGER NOT NULL DEFAULT 3,
    "recommended_interval_seconds" INTEGER NOT NULL DEFAULT 20,
    "recommended_rest_seconds" INTEGER NOT NULL DEFAULT 60,
    "recommended_sets" INTEGER NOT NULL DEFAULT 3,
    "recommended_duration_minutes" INTEGER NOT NULL DEFAULT 20,
    "icon_url" TEXT,
    "color_hex" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_objectives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "description" TEXT,
    "created_by" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "total_circuits" INTEGER NOT NULL,
    "exercises_per_circuit" INTEGER NOT NULL,
    "interval_seconds" INTEGER NOT NULL,
    "rest_seconds" INTEGER NOT NULL,
    "sets_per_circuit" INTEGER NOT NULL,
    "estimated_duration_minutes" INTEGER,
    "estimated_calories" DECIMAL(6,2),
    "difficulty_level" TEXT,
    "equipment_required" JSONB NOT NULL DEFAULT '["bodyweight"]',
    "primary_objective_id" TEXT,
    "times_completed" INTEGER NOT NULL DEFAULT 0,
    "average_rating" DECIMAL(3,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circuits" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "circuit_order" INTEGER NOT NULL,
    "interval_seconds" INTEGER,
    "rest_seconds" INTEGER,
    "sets" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circuits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circuit_exercises" (
    "id" TEXT NOT NULL,
    "circuit_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "exercise_order" INTEGER NOT NULL,
    "reps" INTEGER,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circuit_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT,
    "workout_snapshot" JSONB NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "duration_seconds" INTEGER,
    "circuits_completed" INTEGER,
    "total_exercises_completed" INTEGER,
    "completion_percentage" DECIMAL(5,2),
    "estimated_calories_burned" DECIMAL(6,2),
    "average_heart_rate" INTEGER,
    "max_heart_rate" INTEGER,
    "perceived_difficulty" INTEGER,
    "user_rating" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_objective_mappings" (
    "id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "objective_id" TEXT NOT NULL,
    "relevance_score" INTEGER NOT NULL DEFAULT 100,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_objective_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_exercise_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "max_reps" INTEGER,
    "max_duration_seconds" INTEGER,
    "max_weight_kg" DECIMAL(5,2),
    "last_performed_at" TIMESTAMP(3),
    "last_reps" INTEGER,
    "last_duration_seconds" INTEGER,
    "times_performed" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "difficulty_rating" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_exercise_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_exercises" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorite_workouts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "workout_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_workouts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_auth_provider_auth_provider_id_idx" ON "users"("auth_provider", "auth_provider_id");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_preferences_user_id_key" ON "user_preferences"("user_id");

-- CreateIndex
CREATE INDEX "user_preferences_user_id_idx" ON "user_preferences"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_families_slug_key" ON "exercise_families"("slug");

-- CreateIndex
CREATE INDEX "exercise_families_slug_idx" ON "exercise_families"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "exercises_slug_key" ON "exercises"("slug");

-- CreateIndex
CREATE INDEX "exercises_slug_idx" ON "exercises"("slug");

-- CreateIndex
CREATE INDEX "exercises_primary_category_idx" ON "exercises"("primary_category");

-- CreateIndex
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");

-- CreateIndex
CREATE INDEX "exercises_family_id_idx" ON "exercises"("family_id");

-- CreateIndex
CREATE INDEX "exercises_created_by_idx" ON "exercises"("created_by");

-- CreateIndex
CREATE INDEX "exercises_is_verified_idx" ON "exercises"("is_verified");

-- CreateIndex
CREATE INDEX "exercises_deleted_at_idx" ON "exercises"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "workout_objectives_name_key" ON "workout_objectives"("name");

-- CreateIndex
CREATE UNIQUE INDEX "workout_objectives_slug_key" ON "workout_objectives"("slug");

-- CreateIndex
CREATE INDEX "workout_objectives_slug_idx" ON "workout_objectives"("slug");

-- CreateIndex
CREATE INDEX "workout_objectives_display_order_idx" ON "workout_objectives"("display_order");

-- CreateIndex
CREATE INDEX "workouts_created_by_idx" ON "workouts"("created_by");

-- CreateIndex
CREATE INDEX "workouts_is_template_idx" ON "workouts"("is_template");

-- CreateIndex
CREATE INDEX "workouts_is_public_idx" ON "workouts"("is_public");

-- CreateIndex
CREATE INDEX "workouts_primary_objective_id_idx" ON "workouts"("primary_objective_id");

-- CreateIndex
CREATE INDEX "workouts_difficulty_level_idx" ON "workouts"("difficulty_level");

-- CreateIndex
CREATE INDEX "workouts_deleted_at_idx" ON "workouts"("deleted_at");

-- CreateIndex
CREATE INDEX "circuits_workout_id_idx" ON "circuits"("workout_id");

-- CreateIndex
CREATE INDEX "circuits_circuit_order_idx" ON "circuits"("circuit_order");

-- CreateIndex
CREATE UNIQUE INDEX "circuits_workout_id_circuit_order_key" ON "circuits"("workout_id", "circuit_order");

-- CreateIndex
CREATE INDEX "circuit_exercises_circuit_id_idx" ON "circuit_exercises"("circuit_id");

-- CreateIndex
CREATE INDEX "circuit_exercises_exercise_id_idx" ON "circuit_exercises"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "circuit_exercises_circuit_id_exercise_order_key" ON "circuit_exercises"("circuit_id", "exercise_order");

-- CreateIndex
CREATE INDEX "workout_history_user_id_idx" ON "workout_history"("user_id");

-- CreateIndex
CREATE INDEX "workout_history_workout_id_idx" ON "workout_history"("workout_id");

-- CreateIndex
CREATE INDEX "workout_history_completed_at_idx" ON "workout_history"("completed_at");

-- CreateIndex
CREATE INDEX "workout_history_started_at_idx" ON "workout_history"("started_at");

-- CreateIndex
CREATE INDEX "workout_objective_mappings_workout_id_idx" ON "workout_objective_mappings"("workout_id");

-- CreateIndex
CREATE INDEX "workout_objective_mappings_objective_id_idx" ON "workout_objective_mappings"("objective_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_objective_mappings_workout_id_objective_id_key" ON "workout_objective_mappings"("workout_id", "objective_id");

-- CreateIndex
CREATE INDEX "user_exercise_progress_user_id_idx" ON "user_exercise_progress"("user_id");

-- CreateIndex
CREATE INDEX "user_exercise_progress_exercise_id_idx" ON "user_exercise_progress"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_exercise_progress_user_id_exercise_id_key" ON "user_exercise_progress"("user_id", "exercise_id");

-- CreateIndex
CREATE INDEX "favorite_exercises_user_id_idx" ON "favorite_exercises"("user_id");

-- CreateIndex
CREATE INDEX "favorite_exercises_exercise_id_idx" ON "favorite_exercises"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_exercises_user_id_exercise_id_key" ON "favorite_exercises"("user_id", "exercise_id");

-- CreateIndex
CREATE INDEX "favorite_workouts_user_id_idx" ON "favorite_workouts"("user_id");

-- CreateIndex
CREATE INDEX "favorite_workouts_workout_id_idx" ON "favorite_workouts"("workout_id");

-- CreateIndex
CREATE UNIQUE INDEX "favorite_workouts_user_id_workout_id_key" ON "favorite_workouts"("user_id", "workout_id");

-- AddForeignKey
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_family_id_fkey" FOREIGN KEY ("family_id") REFERENCES "exercise_families"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circuits" ADD CONSTRAINT "circuits_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circuit_exercises" ADD CONSTRAINT "circuit_exercises_circuit_id_fkey" FOREIGN KEY ("circuit_id") REFERENCES "circuits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circuit_exercises" ADD CONSTRAINT "circuit_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_history" ADD CONSTRAINT "workout_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_history" ADD CONSTRAINT "workout_history_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_objective_mappings" ADD CONSTRAINT "workout_objective_mappings_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_objective_mappings" ADD CONSTRAINT "workout_objective_mappings_objective_id_fkey" FOREIGN KEY ("objective_id") REFERENCES "workout_objectives"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_progress" ADD CONSTRAINT "user_exercise_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_exercise_progress" ADD CONSTRAINT "user_exercise_progress_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exercises" ADD CONSTRAINT "favorite_exercises_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_exercises" ADD CONSTRAINT "favorite_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_workouts" ADD CONSTRAINT "favorite_workouts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite_workouts" ADD CONSTRAINT "favorite_workouts_workout_id_fkey" FOREIGN KEY ("workout_id") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
