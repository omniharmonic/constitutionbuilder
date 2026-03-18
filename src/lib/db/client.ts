import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
import { Pool } from '@neondatabase/serverless';
import { drizzle as drizzlePool } from 'drizzle-orm/neon-serverless';
import * as schema from './schema';

// Lazy-initialized HTTP client — only created when first accessed at runtime
let _db: ReturnType<typeof drizzleHttp> | null = null;

export function getDb() {
  if (!_db) {
    const sql = neon(process.env.DATABASE_URL!);
    _db = drizzleHttp(sql, { schema });
  }
  return _db;
}

// Re-export as `db` getter for convenience (use `getDb()` in route handlers)
export const db = new Proxy({} as ReturnType<typeof drizzleHttp>, {
  get(_, prop) {
    return (getDb() as unknown as Record<string | symbol, unknown>)[prop];
  },
});

// Pooled client — for long-running operations (draft gen, synthesis)
// Create per-request, close when done
export function createPooledDb() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const pooledDb = drizzlePool(pool, { schema });
  return { db: pooledDb, pool };
}
