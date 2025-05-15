import { defineMiddleware, sequence } from "astro:middleware";
import { onRequest as supabaseMiddleware } from "./supabase";
import { createSupabaseServer } from "@/lib/supabase";
import type { CookieOptions } from "@supabase/ssr";

const PUBLIC_ROUTES = ["/login", "/register", "/reset-password", "/"];

const authMiddleware = defineMiddleware(async (context, next) => {
  const { cookies, url } = context;

  // Skip auth check for public routes and auth-related API endpoints
  if (PUBLIC_ROUTES.includes(url.pathname) || url.pathname.startsWith("/api/auth")) {
    return next();
  }

  const supabase = createSupabaseServer({
    get: (name: string) => cookies.get(name)?.value,
    set: (name: string, value: string, options?: CookieOptions) =>
      cookies.set(name, value, options),
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    if (url.pathname.startsWith("/api/")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    return context.redirect("/login");
  }

  // User is authenticated, proceed
  const response = await next();
  return response;
});

export const onRequest = sequence(supabaseMiddleware, authMiddleware);
