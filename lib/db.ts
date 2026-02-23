// db.ts
import pkg from "pg";
const { Pool } = pkg;
import { Trend } from '@/types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Tagged template function to match neon() API
export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const text = strings.reduce((acc, str, i) =>
    acc + str + (values[i] !== undefined ? '$' + (i + 1) : ''), '');
  const res = await pool.query(text, values);
  return res.rows;
};

export type { Trend };