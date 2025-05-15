import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/db/database.types";

if (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase environment variables. Make sure PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY are set."
  );
}

export const supabaseE2EClient = createClient<Database>(
  process.env.PUBLIC_SUPABASE_URL,
  process.env.PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);
