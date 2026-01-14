const { Pool } = require('pg');
require('dotenv').config();

async function verifyRLS() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('Connecting to database...\n');
    const client = await pool.connect();

    // Check RLS status for all tables
    console.log('📋 Checking RLS status for all tables:\n');
    const rlsQuery = `
      SELECT
        schemaname,
        tablename,
        rowsecurity AS rls_enabled
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;

    const rlsResult = await client.query(rlsQuery);

    const tables = rlsResult.rows;
    let allEnabled = true;

    tables.forEach(table => {
      const status = table.rls_enabled ? '✅ ENABLED' : '❌ DISABLED';
      console.log(`${status}  ${table.tablename}`);
      if (!table.rls_enabled) {
        allEnabled = false;
      }
    });

    console.log('\n');

    // Count policies for each table
    console.log('📜 Counting RLS policies for each table:\n');
    const policiesQuery = `
      SELECT
        schemaname,
        tablename,
        COUNT(*) as policy_count
      FROM pg_policies
      WHERE schemaname = 'public'
      GROUP BY schemaname, tablename
      ORDER BY tablename;
    `;

    const policiesResult = await client.query(policiesQuery);

    policiesResult.rows.forEach(row => {
      console.log(`  ${row.tablename}: ${row.policy_count} policies`);
    });

    console.log('\n');

    if (allEnabled) {
      console.log('✅ SUCCESS: All tables have Row Level Security enabled!');
    } else {
      console.log('⚠️  WARNING: Some tables do not have RLS enabled.');
    }

    client.release();
  } catch (error) {
    console.error('❌ Error verifying RLS:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyRLS()
  .then(() => {
    console.log('\n✨ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Verification failed:', error);
    process.exit(1);
  });
