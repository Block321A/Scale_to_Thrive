import { createClient } from "@supabase/supabase-js";

// Plain client using the "implicit" flow. Supabase's default invite and reset emails
// return the login token in the link, which only this flow can read (any browser works).
export function createImplicitClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: false, autoRefreshToken: false },
  });
}
