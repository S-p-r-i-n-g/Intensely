import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as fs from 'fs';
import * as path from 'path';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Path to the master CSV (source of truth)
const CSV_PATH = path.resolve(__dirname, '../../exercise_library_master.csv');

// Generate slug from family name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Parse CSV with proper handling of quoted fields containing commas
function parseCSV(content: string): Record<string, string>[] {
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) return [];

  const headers = parseCSVLine(lines[0]);
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

// Parse a single CSV line handling quoted fields
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      // Escaped quote inside quoted field
      current += '"';
      i++; // Skip next quote
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current); // Push last field

  return result;
}

// Convert "True"/"False" string to boolean
function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

// Parse JSON string or return default
function parseJSON<T>(value: string, defaultValue: T): T {
  if (!value || value.trim() === '' || value === '[]') {
    return defaultValue;
  }
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

// Parse optional string (empty string becomes null)
function parseOptionalString(value: string): string | null {
  return value && value.trim() !== '' ? value : null;
}

// Parse optional number
function parseOptionalNumber(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Parse optional integer
function parseOptionalInt(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const num = parseInt(value, 10);
  return isNaN(num) ? null : num;
}

async function main() {
  console.log('📥 Starting exercise import from CSV...\n');

  // Read CSV
  console.log(`📖 Reading exercises from: ${CSV_PATH}`);
  if (!fs.existsSync(CSV_PATH)) {
    throw new Error(`CSV file not found: ${CSV_PATH}`);
  }

  const csvContent = fs.readFileSync(CSV_PATH, 'utf-8');
  const exercises = parseCSV(csvContent);
  console.log(`📊 Found ${exercises.length} exercises in CSV\n`);

  // Step 1: Collect unique family names and upsert ExerciseFamily records
  const familyNames = [...new Set(exercises.map(e => e.familyName).filter(Boolean))];
  console.log(`👪 Found ${familyNames.length} unique exercise families: ${familyNames.join(', ')}\n`);

  const familyMap = new Map<string, string>(); // familyName -> familyId

  for (const familyName of familyNames) {
    const slug = slugify(familyName);
    const family = await prisma.exerciseFamily.upsert({
      where: { slug },
      update: { name: familyName },
      create: { name: familyName, slug }
    });
    familyMap.set(familyName, family.id);
    console.log(`  ✓ Family: ${familyName} (${family.id})`);
  }
  console.log('');

  // Step 2: Import exercises
  let imported = 0;
  let updated = 0;
  let errors = 0;

  for (const row of exercises) {
    try {
      const familyId = row.familyName ? familyMap.get(row.familyName) || null : null;

      const exerciseData = {
        name: row.name,
        slug: row.slug,
        familyId,
        primaryCategory: row.primaryCategory,
        difficulty: row.difficulty,
        primaryMuscles: parseJSON<string[]>(row.primaryMuscles, []),
        secondaryMuscles: parseJSON<string[]>(row.secondaryMuscles, []),
        movementPattern: parseOptionalString(row.movementPattern),
        forceType: parseOptionalString(row.forceType),
        mechanic: parseOptionalString(row.mechanic),
        equipment: parseJSON<string[]>(row.equipment, ['bodyweight']),
        hictSuitable: parseBoolean(row.hictSuitable),
        smallSpace: parseBoolean(row.smallSpace),
        quiet: parseBoolean(row.quiet),
        cardioIntensive: parseBoolean(row.cardioIntensive),
        strengthFocus: parseBoolean(row.strengthFocus),
        mobilityFocus: parseBoolean(row.mobilityFocus),
        beginnerFriendly: parseBoolean(row.beginnerFriendly),
        minimalTransition: parseBoolean(row.minimalTransition),
        description: parseOptionalString(row.description),
        instructions: parseJSON<string[]>(row.instructions, []),
        tips: parseJSON<string[]>(row.tips, []),
        commonMistakes: parseJSON<string[]>(row.commonMistakes, []),
        breathing: parseOptionalString(row.breathing),
        thumbnailUrl: parseOptionalString(row.thumbnailUrl),
        gifUrl: parseOptionalString(row.gifUrl),
        videoUrl: parseOptionalString(row.videoUrl),
        defaultReps: parseOptionalInt(row.defaultReps),
        defaultDurationSeconds: parseOptionalInt(row.defaultDurationSeconds),
        caloriesPerMinute: parseOptionalNumber(row.caloriesPerMinute),
        metValue: parseOptionalNumber(row.metValue),
        isVerified: parseBoolean(row.isVerified),
        popularityScore: parseOptionalInt(row.popularityScore) || 0
      };

      // Check if exercise exists by ID or slug
      const existing = row.id
        ? await prisma.exercise.findFirst({
            where: { OR: [{ id: row.id }, { slug: row.slug }] }
          })
        : await prisma.exercise.findUnique({ where: { slug: row.slug } });

      if (existing) {
        // Update existing exercise
        await prisma.exercise.update({
          where: { id: existing.id },
          data: exerciseData
        });
        updated++;
      } else {
        // Create new exercise (use provided ID if available)
        await prisma.exercise.create({
          data: {
            id: row.id || undefined,
            ...exerciseData
          }
        });
        imported++;
      }

      if ((imported + updated) % 20 === 0) {
        console.log(`  ✓ Processed ${imported + updated} exercises...`);
      }
    } catch (error) {
      console.error(`  ✗ Error importing "${row.name}":`, error);
      errors++;
    }
  }

  console.log(`\n✅ Import complete!`);
  console.log(`   📊 New: ${imported} exercises`);
  console.log(`   🔄 Updated: ${updated} exercises`);
  console.log(`   ❌ Errors: ${errors}`);

  // Final count
  const totalCount = await prisma.exercise.count();
  console.log(`\n🎉 Database now has ${totalCount} exercises!\n`);
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
