import type { MiddlewareHandler } from "astro";
import { createSupabaseServer } from "@/lib/supabase";
import type { CookieOptions } from "astro";

export const authMiddleware: MiddlewareHandler = async (context) => {
  const { cookies, url, redirect } = context;

  // Skip auth check for public routes
  const publicRoutes = ["/login", "/register", "/reset-password", "/"];
  if (publicRoutes.includes(url.pathname)) {
    return;
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
    return redirect("/login");
  }
};
