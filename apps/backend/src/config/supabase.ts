import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  Supabase environment variables are missing. Database connection will fail.');
}

// Create a single supabase client for interacting with your database
// Note: We use the service_role key to bypass RLS for backend admin operations (like inserting news)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
    }
  }
);
