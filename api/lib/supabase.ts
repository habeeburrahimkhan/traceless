import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing Supabase credentials. Serverless API will run in sandbox fallback mode.");
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
