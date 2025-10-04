import { createClient } from '@supabase/supabase-js';

export const client = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);