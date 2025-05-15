import { defineMiddleware } from "astro:middleware";
import { createSupabaseServer, cookieOptions } from "../lib/supabase";
import { createMockSupabaseServer } from "../../tests/e2e/mocks/supabase.mock";

export const onRequest = defineMiddleware(async (context, next) => {
  // W trybie testowym używamy mocka
  const supabase =
    import.meta.env.MODE === "test"
      ? createMockSupabaseServer()
      : createSupabaseServer({
          get: (name) => {
            const cookie = context.cookies.get(name);
            console.log("Reading cookie in middleware:", name, "exists:", !!cookie?.value);
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

  // Get authenticated user
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (!error && user) {
      context.locals.user = user;
    }
  } catch (error) {
    console.error("Error getting user in middleware:", error);
  }

  const response = await next();

  // Handle response cookies for auth
  try {
    // Get all Supabase auth cookies
    const supabaseCookies = ["sb-access-token", "sb-refresh-token"];

    // Add Set-Cookie headers for Supabase auth cookies
    supabaseCookies.forEach((name) => {
      const cookie = context.cookies.get(name);
      if (cookie?.value) {
        const cookieHeader = `${name}=${cookie.value}; Path=/; HttpOnly; SameSite=Lax${
          import.meta.env.PROD ? "; Secure" : ""
        }`;
        response.headers.append("Set-Cookie", cookieHeader);
      }
    });
  } catch (error) {
    console.error("Error handling cookies in middleware:", error);
  }

  return response;
});
