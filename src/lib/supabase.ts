import { createClient, type AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import type { AuthError } from "@/types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  throw new Error("Invalid Supabase URL format");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      "x-application-name": "10xCards",
    },
    fetch: (url, options = {}) => {
      const defaultOptions = {
        ...options,
        timeout: 30000,
        headers: {
          ...options.headers,
          "Cache-Control": "no-cache",
        },
      };

      return fetch(url, defaultOptions)
        .then(async (response) => {
          if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
          }
          return response;
        })
        .catch((error) => {
          console.error("Supabase fetch error:", error);
          throw error;
        });
    },
  },
  db: {
    schema: "public",
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
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
