import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Configuration for Vercel + Supabase
 * 
 * IMPORTANT: Environment Variables Setup
 * 
 * DATABASE_URL (Required - for runtime queries):
 *   postgresql://postgres.[project-ref]:[password]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
 * 
 * DIRECT_DATABASE_URL (Required - for migrations/introspection):
 *   postgresql://postgres.[project-ref]:[password]@db.[project-ref].supabase.co:5432/postgres
 * 
 * For Vercel deployment:
 * - DATABASE_URL uses the POOLER connection (port 6543, pgbouncer=true)
 * - DIRECT_DATABASE_URL uses DIRECT connection (port 5432) - but Vercel can't reach this
 * - For Vercel builds, set DIRECT_DATABASE_URL to the pooler URL as well (prisma generate doesn't need it)
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // In production (Vercel), use the environment variables as configured in Prisma schema
  // Prisma automatically uses DATABASE_URL for queries and DIRECT_DATABASE_URL for migrations
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  return new PrismaClient({
    log: isProduction ? ['error'] : ['query', 'error', 'warn'],
    // Don't override datasources - let Prisma use schema.prisma configuration
  });
}

// Singleton pattern for Prisma client to prevent multiple instances in development
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Also export as 'db' for convenience
export const db = prisma;

// Store in global for development hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown for local development
if (process.env.NODE_ENV !== 'production') {
  process.on('beforeExit', async () => {
    await prisma.$disconnect();
  });
}

// Test database connection (useful for debugging)
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1`;
    return { success: true, message: 'Database connected successfully' };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database connection failed:', errorMessage);
    return { success: false, message: errorMessage };
  }
}

// Helper to check if database is configured
export function isDatabaseConfigured(): boolean {
  return !!(process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL);
}
