import { createClient } from '@supabase/supabase-js';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://fkmzuwdtssuiokfnmorf.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || 'sb_publishable_BRRQwe4Q1qS27HfA0H8ZfQ_4NLiWazx';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Direct PostgreSQL Connection Pool (Active when valid password is supplied in DATABASE_URL)
const rawDbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || 'postgresql://postgres:[YOUR-PASSWORD]@db.fkmzuwdtssuiokfnmorf.supabase.co:5432/postgres';

export const pgPool = (!rawDbUrl.includes('[YOUR-PASSWORD]'))
  ? new pg.Pool({ connectionString: rawDbUrl, ssl: { rejectUnauthorized: false } })
  : null;

export default supabase;
