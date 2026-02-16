import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Ensure environment variables are loaded from the root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Validate DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Create connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Create Prisma client with adapter (required for Prisma 7)
const prisma = new PrismaClient({ adapter });

// Handle cleanup on process termination
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  await pool.end();
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
});

export { prisma, pool };
