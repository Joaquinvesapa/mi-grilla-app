import { createClient } from "@supabase/supabase-js";

/**
 * Creates a Supabase admin client with service_role key.
 * Bypasses RLS — use ONLY in Server Actions / Route Handlers.
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY in .env (NOT the anon key).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
