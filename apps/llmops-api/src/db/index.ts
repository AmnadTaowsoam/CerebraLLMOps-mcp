import { Pool, PoolClient } from 'pg';
import { settings } from '../config/settings.js';
import { logger } from '../utils/logger.js';
import fs from 'node:fs';
import path from 'node:path';

let pool: Pool | undefined;

export function initDb(): Pool {
  if (pool) return pool;
  pool = new Pool({ connectionString: settings.DATABASE_URL, max: 10 });
  pool.on('error', (err) => logger.error({ err }, '[DB] Pool error'));
  logger.info('[DB] Pool initialized');
  return pool;
}

export function getDb(): Pool {
  if (!pool) throw new Error('DB not initialized — call initDb() first');
  return pool;
}

export async function withTenant<T>(
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const db = getDb();
  const client = await db.connect();
  try {
    // HOTFIX-15 (2026-05-29): SET LOCAL needs an active transaction. Without
    // BEGIN/COMMIT it's scoped to the implicit-txn for that one statement,
    // so subsequent queries see app.tenant_id unset and RLS denies all rows.
    // Use session-level SET — the client is released after fn() returns so
    // the setting doesn't leak across pool clients.
    await client.query(`SET app.tenant_id = '${tenantId.replace(/'/g, "''")}'`);
    return await fn(client);
  } finally {
    client.release();
  }
}

/** Run migrations on startup when DATABASE_URL is set */
export async function runMigrations(): Promise<void> {
  const db = initDb();
  // Resolve migrations dir relative to process.cwd() (workspace root)
  const migrationsDir = path.resolve(process.cwd(), '..', '..', 'migrations');

  if (!fs.existsSync(migrationsDir)) {
    logger.warn('[DB] migrations directory not found, skipping');
    return;
  }

  const files = fs.readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    logger.info({ file }, '[DB] Running migration');
    await db.query(sql);
    logger.info({ file }, '[DB] Migration OK');
  }
}
