import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const globalForPg = globalThis as unknown as { pool: Pool };

export const pool =
  globalForPg.pool ??
  new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'maps',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '123123',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export const db = drizzle(pool, { schema });
export default db;
