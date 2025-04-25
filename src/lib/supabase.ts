import { createClient, type AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import type { AuthError } from "@/types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export const formatAuthError = (error: SupabaseAuthError | Error | unknown): AuthError => {
  if (error && typeof error === "object" && "message" in error) {
    return {
      message: String(error.message),
      code: "code" in error && error.code ? String(error.code) : undefined,
    };
  }
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
};
