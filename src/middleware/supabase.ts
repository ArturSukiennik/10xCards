import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer, cookieOptions } from "../lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServer({
    get: (name) => {
      const cookie = context.cookies.get(name);
      return cookie?.value;
    },
    set: (name, value, options) => {
      context.cookies.set(name, value, {
        ...cookieOptions,
        ...options,
      });
    },
  });

  context.locals.supabase = supabase;

  // Get authenticated user
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!error && user) {
      context.locals.user = user;
    }
  } catch {
    // Ignore auth errors in middleware
  }

  const response = await next();

  // Handle response cookies for auth
  try {
    const cookieEntries = Object.entries(context.cookies);
    if (cookieEntries.length > 0) {
      cookieEntries.forEach(([name, value]) => {
        if (name.startsWith("sb-")) {
          response.headers.append("Set-Cookie", value);
        }
      });
    }
  } catch {
    // Ignore cookie handling errors
  }

  return response;
});
