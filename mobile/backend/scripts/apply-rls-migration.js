const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyRLSMigration() {
  // Use the pooled connection from DATABASE_URL
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Reading migration file...');
    const migrationPath = path.join(__dirname, '../prisma/migrations/20260114000000_enable_rls/migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('Applying RLS migration...');
    await client.query(migrationSQL);

    console.log('✅ RLS migration applied successfully!');
    console.log('All tables now have Row Level Security enabled with appropriate policies.');

    client.release();
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

applyRLSMigration()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration failed:', error);
    process.exit(1);
  });
