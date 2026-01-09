import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔍 Verifying database contents...\n');

  // Check workout objectives
  const objectives = await prisma.workoutObjective.findMany({
    orderBy: { displayOrder: 'asc' }
  });
  console.log(`✅ Workout Objectives: ${objectives.length}`);
  objectives.forEach(obj => console.log(`   - ${obj.name} (${obj.slug})`));

  // Check exercise families
  const families = await prisma.exerciseFamily.findMany({
    orderBy: { name: 'asc' }
  });
  console.log(`\n✅ Exercise Families: ${families.length}`);
  families.forEach(fam => console.log(`   - ${fam.name}`));

  // Check exercises
  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  });
  console.log(`\n✅ Exercises: ${exercises.length}`);

  // Group by category
  const byCategory: Record<string, number> = {};
  exercises.forEach(ex => {
    byCategory[ex.primaryCategory] = (byCategory[ex.primaryCategory] || 0) + 1;
  });

  console.log('\n📊 Exercises by Category:');
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   - ${cat}: ${count} exercises`);
  });

  // Group by difficulty
  const byDifficulty: Record<string, number> = {};
  exercises.forEach(ex => {
    byDifficulty[ex.difficulty] = (byDifficulty[ex.difficulty] || 0) + 1;
  });

  console.log('\n📊 Exercises by Difficulty:');
  Object.entries(byDifficulty).sort().forEach(([diff, count]) => {
    console.log(`   - ${diff}: ${count} exercises`);
  });

  // Check HICT suitable exercises
  const hictSuitable = exercises.filter(ex => ex.hictSuitable).length;
  const smallSpace = exercises.filter(ex => ex.smallSpace).length;
  const quiet = exercises.filter(ex => ex.quiet).length;

  console.log('\n📊 Exercise Characteristics:');
  console.log(`   - HICT Suitable: ${hictSuitable}/${exercises.length}`);
  console.log(`   - Small Space: ${smallSpace}/${exercises.length}`);
  console.log(`   - Quiet: ${quiet}/${exercises.length}`);

  // Sample a few exercises
  console.log('\n📋 Sample Exercises:');
  const sample = exercises.slice(0, 5);
  sample.forEach(ex => {
    console.log(`   - ${ex.name}`);
    console.log(`     Category: ${ex.primaryCategory} | Difficulty: ${ex.difficulty}`);
    console.log(`     Primary Muscles: ${JSON.stringify(ex.primaryMuscles)}`);
    console.log(`     HICT: ${ex.hictSuitable} | Small Space: ${ex.smallSpace} | Quiet: ${ex.quiet}`);
    console.log('');
  });

  console.log('✅ Verification complete!\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
