import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer, cookieOptions } from "../lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  console.log("Initializing Supabase middleware");

  const supabase = createSupabaseServer({
    get: (name) => {
      const cookie = context.cookies.get(name);
      console.log("Getting cookie in middleware:", name, "exists:", !!cookie?.value);
      return cookie?.value;
    },
    set: (name, value, options) => {
      console.log("Setting cookie in middleware:", name);
      context.cookies.set(name, value, {
        ...cookieOptions,
        ...options,
      });
    },
  });

  context.locals.supabase = supabase;

  // Get session
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      console.error("Error getting session in middleware:", error);
    } else {
      console.log("Session check in middleware:", session ? "Session exists" : "No session");
      if (session) {
        context.locals.user = session.user;
      }
    }
  } catch (error) {
    console.error("Error in session check:", error);
  }

  const response = await next();

  // Handle response cookies for auth
  try {
    const cookieEntries = Object.entries(context.cookies);
    if (cookieEntries.length > 0) {
      cookieEntries.forEach(([name, value]) => {
        if (name.startsWith("sb-")) {
          console.log("Adding Supabase cookie to response:", name);
          response.headers.append("Set-Cookie", value);
        }
      });
    }
  } catch (error) {
    console.error("Error handling cookies:", error);
  }

  return response;
});
