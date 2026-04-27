// Server-side Supabase client for API routes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create authenticated Supabase client using the user's JWT from request headers
export function createServerClient(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}

// Create anon Supabase client (for webhook/public operations)
export function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
