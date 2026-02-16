import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function removeDuplicateWorkouts() {
  console.log('🔍 Finding duplicate workouts...\n');

  // Find all workouts grouped by name and createdBy
  const workouts = await prisma.workout.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'asc', // Keep the oldest one
    },
  });

  // Group by name + createdBy
  const groupedWorkouts = new Map<string, any[]>();

  for (const workout of workouts) {
    const key = `${workout.name}||${workout.createdBy || 'null'}`;
    if (!groupedWorkouts.has(key)) {
      groupedWorkouts.set(key, []);
    }
    groupedWorkouts.get(key)!.push(workout);
  }

  // Find duplicates
  let totalDuplicates = 0;
  const toDelete: string[] = [];

  for (const [key, group] of groupedWorkouts) {
    if (group.length > 1) {
      console.log(`📋 Found ${group.length} workouts with key: ${key}`);
      // Keep the first (oldest), mark rest for deletion
      for (let i = 1; i < group.length; i++) {
        console.log(`  ❌ Marking for deletion: ${group[i].id} - ${group[i].name}`);
        toDelete.push(group[i].id);
        totalDuplicates++;
      }
    }
  }

  if (toDelete.length === 0) {
    console.log('\n✅ No duplicate workouts found!\n');
    return;
  }

  console.log(`\n⚠️  Found ${totalDuplicates} duplicate workouts to remove\n`);

  // Delete duplicates
  for (const workoutId of toDelete) {
    try {
      // First delete related records
      await prisma.workoutHistory.deleteMany({
        where: { workoutId },
      });

      await prisma.workoutObjectiveMapping.deleteMany({
        where: { workoutId },
      });

      await prisma.favoriteWorkout.deleteMany({
        where: { workoutId },
      });

      // Delete circuit exercises
      const circuits = await prisma.circuit.findMany({
        where: { workoutId },
      });

      for (const circuit of circuits) {
        await prisma.circuitExercise.deleteMany({
          where: { circuitId: circuit.id },
        });
      }

      // Delete circuits
      await prisma.circuit.deleteMany({
        where: { workoutId },
      });

      // Finally delete the workout
      await prisma.workout.delete({
        where: { id: workoutId },
      });

      console.log(`  ✓ Deleted workout: ${workoutId}`);
    } catch (error) {
      console.error(`  ✗ Failed to delete workout ${workoutId}:`, error);
    }
  }

  console.log(`\n✅ Successfully removed ${totalDuplicates} duplicate workouts!\n`);
}

removeDuplicateWorkouts()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
