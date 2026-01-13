import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Path to Free Exercise DB
const EXERCISES_JSON_PATH = '/tmp/free-exercise-db/dist/exercises.json';

// Category mapping from Free Exercise DB to our taxonomy
const CATEGORY_MAP: Record<string, string> = {
  'strength': 'full_body', // Default to full body, we'll refine based on muscles
  'cardio': 'cardio',
  'stretching': 'full_body',
  'plyometrics': 'plyometric',
  'strongman': 'full_body',
  'powerlifting': 'full_body',
  'olympic_weightlifting': 'full_body'
};

// Muscle group to category mapping
function getCategoryFromMuscles(primaryMuscles: string[]): string {
  if (!primaryMuscles || primaryMuscles.length === 0) return 'full_body';

  const muscle = primaryMuscles[0].toLowerCase();

  // Upper Body Push
  if (['chest', 'triceps', 'shoulders'].includes(muscle)) {
    return 'upper_body_push';
  }

  // Upper Body Pull
  if (['lats', 'middle back', 'biceps', 'forearms', 'traps'].includes(muscle)) {
    return 'upper_body_pull';
  }

  // Lower Body
  if (['quadriceps', 'hamstrings', 'glutes', 'calves', 'adductors', 'abductors'].includes(muscle)) {
    return 'lower_body';
  }

  // Core
  if (['abdominals', 'lower back'].includes(muscle)) {
    return 'core';
  }

  return 'full_body';
}

// Normalize equipment to our taxonomy
function normalizeEquipment(equipment: string): string[] {
  const eq = equipment.toLowerCase();

  if (eq.includes('body only') || eq.includes('bodyweight')) {
    return ['bodyweight'];
  }

  if (eq.includes('dumbbell')) return ['bodyweight', 'dumbbell'];
  if (eq.includes('barbell')) return ['bodyweight', 'barbell'];
  if (eq.includes('kettlebell')) return ['bodyweight', 'kettlebell'];
  if (eq.includes('bands')) return ['bodyweight', 'resistance-band'];
  if (eq.includes('cable')) return ['bodyweight', 'cable'];
  if (eq.includes('machine')) return ['bodyweight', 'machine'];
  if (eq.includes('pull-up') || eq.includes('pullup')) return ['pull-up-bar'];

  return ['bodyweight'];
}

// Determine if exercise is HICT suitable (bodyweight or minimal equipment)
function isHICTSuitable(equipment: string): boolean {
  const eq = equipment.toLowerCase();
  return eq.includes('body only') ||
         eq.includes('bodyweight') ||
         eq.includes('pull-up') ||
         eq.includes('bands');
}

// Map force type
function getForceType(force: string | null): string | null {
  if (!force) return null;
  const f = force.toLowerCase();
  if (f === 'push') return 'push';
  if (f === 'pull') return 'pull';
  if (f === 'static') return 'static';
  return null;
}

// Generate slug from name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Determine if exercise is cardio intensive
function isCardioIntensive(category: string, primaryMuscles: string[]): boolean {
  return category === 'cardio' || category === 'plyometric';
}

// Determine if suitable for small spaces
function isSmallSpace(name: string): boolean {
  const n = name.toLowerCase();
  // Exercises that typically don't need much space
  return !n.includes('sprint') && !n.includes('run') && !n.includes('jog');
}

// Determine if quiet (low impact)
function isQuiet(category: string, name: string): boolean {
  const n = name.toLowerCase();
  return !n.includes('jump') && !n.includes('hop') && category !== 'plyometric';
}

async function main() {
  console.log('📥 Starting exercise import from Free Exercise DB...\n');

  // Read exercises JSON
  console.log(`📖 Reading exercises from: ${EXERCISES_JSON_PATH}`);
  const exercisesData = JSON.parse(fs.readFileSync(EXERCISES_JSON_PATH, 'utf-8'));
  console.log(`📊 Found ${exercisesData.length} exercises\n`);

  // Filter for bodyweight exercises (HICT focus)
  const bodyweightExercises = exercisesData.filter((ex: any) =>
    ex.equipment && ex.equipment.toLowerCase().includes('body only')
  );

  console.log(`🏋️ Filtering to ${bodyweightExercises.length} bodyweight exercises for HICT\n`);

  let imported = 0;
  let skipped = 0;

  for (const exercise of bodyweightExercises) {
    try {
      const primaryCategory = exercise.category
        ? CATEGORY_MAP[exercise.category] || 'full_body'
        : getCategoryFromMuscles(exercise.primaryMuscles);

      const slug = slugify(exercise.name);
      const equipment = normalizeEquipment(exercise.equipment);

      // Map difficulty level
      let difficulty = 'intermediate';
      if (exercise.level) {
        const level = exercise.level.toLowerCase();
        if (level === 'beginner') difficulty = 'beginner';
        else if (level === 'expert') difficulty = 'advanced';
      }

      // Create exercise
      await prisma.exercise.upsert({
        where: { slug },
        update: {
          name: exercise.name,
          primaryCategory,
          difficulty,
          primaryMuscles: exercise.primaryMuscles || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          movementPattern: null, // Will be added manually later
          forceType: getForceType(exercise.force),
          mechanic: exercise.mechanic,
          equipment,
          hictSuitable: isHICTSuitable(exercise.equipment),
          smallSpace: isSmallSpace(exercise.name),
          quiet: isQuiet(exercise.category || '', exercise.name),
          cardioIntensive: isCardioIntensive(exercise.category || '', exercise.primaryMuscles || []),
          strengthFocus: exercise.category === 'strength',
          mobilityFocus: exercise.category === 'stretching',
          beginnerFriendly: difficulty === 'beginner',
          minimalTransition: true,
          description: exercise.instructions && exercise.instructions.length > 0
            ? exercise.instructions[0]
            : null,
          instructions: exercise.instructions || [],
          tips: [],
          commonMistakes: [],
          breathing: null,
          images: exercise.images || [],
          isVerified: true,
          popularityScore: 0
        },
        create: {
          name: exercise.name,
          slug,
          primaryCategory,
          difficulty,
          primaryMuscles: exercise.primaryMuscles || [],
          secondaryMuscles: exercise.secondaryMuscles || [],
          movementPattern: null,
          forceType: getForceType(exercise.force),
          mechanic: exercise.mechanic,
          equipment,
          hictSuitable: isHICTSuitable(exercise.equipment),
          smallSpace: isSmallSpace(exercise.name),
          quiet: isQuiet(exercise.category || '', exercise.name),
          cardioIntensive: isCardioIntensive(exercise.category || '', exercise.primaryMuscles || []),
          strengthFocus: exercise.category === 'strength',
          mobilityFocus: exercise.category === 'stretching',
          beginnerFriendly: difficulty === 'beginner',
          minimalTransition: true,
          description: exercise.instructions && exercise.instructions.length > 0
            ? exercise.instructions[0]
            : null,
          instructions: exercise.instructions || [],
          tips: [],
          commonMistakes: [],
          breathing: null,
          images: exercise.images || [],
          isVerified: true,
          popularityScore: 0
        }
      });

      imported++;
      if (imported % 10 === 0) {
        console.log(`  ✓ Imported ${imported} exercises...`);
      }
    } catch (error) {
      console.error(`  ✗ Error importing "${exercise.name}":`, error);
      skipped++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   📊 Imported: ${imported} exercises`);
  console.log(`   ⚠️  Skipped: ${skipped} exercises`);
  console.log(`\n🎉 Database now has ${imported} bodyweight exercises ready for HICT workouts!\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error during import:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
