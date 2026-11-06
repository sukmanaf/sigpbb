import { Pool, PoolConfig } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const globalForPg = globalThis as unknown as { pool: Pool };

const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;

// Jika DB_SSL di-set true, atau jika di production/Vercel ke database remote (bukan localhost) dan DB_SSL tidak explicitly 'false'
const shouldEnableSSL =
  process.env.DB_SSL === 'true' ||
  (isProduction && process.env.DB_SSL !== 'false' && process.env.DB_HOST !== 'localhost' && process.env.DB_HOST !== '127.0.0.1');

const sslConfig = shouldEnableSSL ? { rejectUnauthorized: false } : undefined;

const poolConfig: PoolConfig = (process.env.DATABASE_URL || process.env.POSTGRES_URL)
  ? {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
      ssl: sslConfig,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT || '10000'),
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'maps',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '123123',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT || '10000'),
      ssl: sslConfig,
    };

export const pool = globalForPg.pool ?? new Pool(poolConfig);

if (process.env.NODE_ENV !== 'production') globalForPg.pool = pool;

export const db = drizzle(pool, { schema });
export default db;

