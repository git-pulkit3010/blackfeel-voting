import { neon } from '@neondatabase/serverless';
import { Trend } from '@/types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const sql = neon(process.env.DATABASE_URL);

export type { Trend };
