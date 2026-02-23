// db.ts
import pkg from "pg";
const { Pool } = pkg;
import { Trend } from '@/types';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in environment variables');
}

// Append uselibpqcompat=true to adopt libpq semantics now
const connectionString = `${process.env.DATABASE_URL}${process.env.DATABASE_URL.includes('?') ? '&' : '?'}uselibpqcompat=true`;

export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

export const sql = async (strings: TemplateStringsArray, ...values: any[]) => {
  const text = strings.reduce((acc, str, i) =>
    acc + str + (values[i] !== undefined ? '$' + (i + 1) : ''), '');
  const res = await pool.query(text, values);
  return res.rows;
};

export type { Trend };