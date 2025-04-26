import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "../lib/supabase";

export const onRequest = defineMiddleware(async (context, next) => {
  const supabase = createSupabaseServer({
    get: (name) => {
      const cookie = context.cookies.get(name);
      return cookie?.value;
    },
    set: (name, value, options) => {
      context.cookies.set(name, value, options);
    },
  });

  context.locals.supabase = supabase;

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session) {
    context.locals.user = session.user;
  }

  const response = await next();

  // Handle response cookies for auth
  const cookieEntries = Object.entries(context.cookies);
  if (cookieEntries.length > 0) {
    cookieEntries.forEach(([name, value]) => {
      if (name.startsWith("sb-")) {
        response.headers.append("Set-Cookie", value);
      }
    });
  }

  return response;
});
