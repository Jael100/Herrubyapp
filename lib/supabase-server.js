// Server-side Supabase client for API routes
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Fetch that opts out of Next.js's data cache so Supabase reads are never stale
const noStoreFetch = (url, options) => fetch(url, { ...options, cache: 'no-store' });

// User-scoped client — verifies JWT and enforces RLS
export function createServerClient(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      fetch: noStoreFetch,
    },
  });
}

// Admin client — bypasses RLS, use only in server-side routes for trusted mutations
export function createAdminClient() {
  const key = supabaseServiceKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { fetch: noStoreFetch },
  });
}

// Anon client (for webhook/public operations)
export function createAnonClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
