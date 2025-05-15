import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer } from "@/lib/supabase";
import type { SerializeOptions } from "cookie";

export const authMiddleware = defineMiddleware(async (context, next) => {
  const { cookies, url, redirect } = context;

  // Skip auth check for public routes
  const publicRoutes = ["/login", "/register", "/reset-password", "/"];
  if (publicRoutes.includes(url.pathname)) {
    return next();
  }

  const supabase = createSupabaseServer({
    get: (name: string) => cookies.get(name)?.value,
    set: (name: string, value: string, options?: SerializeOptions) =>
      cookies.set(name, value, options),
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return redirect("/login");
  }

  return next();
});
