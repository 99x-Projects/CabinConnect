import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Single shared Supabase JS client. ONLY uses the public `anon` key — never the
 * `service_role` key. The service_role key bypasses RLS and MUST stay
 * server-side; if it shows up in `VITE_*` env, treat it as a security incident.
 *
 * Auth is handled by Supabase (PKCE flow, default). For data mutations, the
 * React app calls the .NET API — not Supabase REST/PostgREST directly. See
 * CLAUDE.md §1 system boundaries.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const authStorageKey = 'cabinconnect-auth-token';

function getSafeLocalStorage(): Storage | undefined {
  if (globalThis.window === undefined) {
    return undefined;
  }

  try {
    const testKey = '__cabinconnect_storage_test__';
    globalThis.localStorage.setItem(testKey, 'ok');
    globalThis.localStorage.removeItem(testKey);
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

if (!url || !anonKey) {
  // Surfacing early as a hard error makes the misconfiguration obvious in dev.
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local and fill the values.',
  );
}

const browserStorage = getSafeLocalStorage();

export const supabaseClient: SupabaseClient = createClient(url, anonKey, {
  auth: {
    persistSession: browserStorage !== undefined,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storage: browserStorage,
    storageKey: authStorageKey,
  },
});
