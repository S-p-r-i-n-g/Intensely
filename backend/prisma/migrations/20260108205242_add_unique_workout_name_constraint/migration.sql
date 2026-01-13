-- CreateIndex
CREATE UNIQUE INDEX "unique_workout_name_per_user" ON "workouts"("name", "created_by");
