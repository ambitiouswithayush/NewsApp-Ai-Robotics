import { createClient } from '@supabase/supabase-js';

// We must use the ANON key for the frontend, NOT the service role key!
const supabaseUrl = 'https://pmlyzcvgxydtabpxtgwq.supabase.co';
const supabaseAnonKey = 'sb_publishable_RnKH_m28H68EyLZeqwrwRQ_20Y6N97G';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
