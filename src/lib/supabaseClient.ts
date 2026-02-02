import { createClient } from '@supabase/supabase-js';

// Replace with your actual Supabase project URL and anon key
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
