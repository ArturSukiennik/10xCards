import { createClient, type AuthError as SupabaseAuthError } from "@supabase/supabase-js";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { AuthError } from "@/types";

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase configuration:", {
  url: supabaseUrl,
  hasAnonKey: !!supabaseAnonKey,
  hasServiceKey: !!supabaseServiceKey,
});

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error("Invalid Supabase URL format");
}

export const cookieOptions: CookieOptions = {
  path: "/",
  secure: import.meta.env.PROD,
  httpOnly: true,
  sameSite: "lax",
};

// Create admin client with service role key
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
      global: {
        headers: {
          "x-application-name": "10xCards-admin",
        },
      },
    })
  : null;

// Create server client for SSR
export const createSupabaseServer = (cookies: {
  get: (name: string) => string | undefined;
  set: (name: string, value: string, options?: CookieOptions) => void;
}) => {
  console.log("Creating Supabase server client with URL:", supabaseUrl);
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get: (name: string) => {
        const value = cookies.get(name);
        console.log("Reading cookie:", name, "value:", value ? "exists" : "undefined");
        return value;
      },
      set: (name: string, value: string, options?: CookieOptions) => {
        console.log("Setting cookie:", name, "options:", options);
        cookies.set(name, value, options);
      },
      remove: (name: string, options?: CookieOptions) => {
        console.log("Removing cookie:", name);
        cookies.set(name, "", { ...options, maxAge: 0 });
      },
    },
  });
};

// Helper function to format auth errors
export const formatAuthError = (error: unknown): AuthError => {
  if (error instanceof Error) {
    return {
      message: error.message,
      code: "UNKNOWN_ERROR",
    };
  }

  const supabaseError = error as SupabaseAuthError;
  return {
    message: supabaseError.message || "An unknown error occurred",
    code: supabaseError.name || "UNKNOWN_ERROR",
  };
};
