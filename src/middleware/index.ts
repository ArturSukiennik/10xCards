import { defineMiddleware, sequence } from "astro:middleware";
import { onRequest as supabaseMiddleware } from "./supabase";

const PUBLIC_ROUTES = ["/login", "/register"];
const PUBLIC_API_ROUTES = [
  "/api/auth",
  "/api/auth/register",
  "/api/auth/login",
  "/api/auth/session",
];
const API_ROUTES = /^\/api\//;

const authMiddleware = defineMiddleware(async ({ locals, request, redirect }, next) => {
  try {
    const url = new URL(request.url);
    const { pathname } = url;

    // Skip auth check for public routes and public API endpoints
    if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API_ROUTES.includes(pathname)) {
      try {
        // Use getUser instead of getSession for secure verification
        const {
          data: { user },
          error: userError,
        } = await locals.supabase.auth.getUser();

        if (userError) {
          console.error("Error checking user for public route:", userError);
          return next();
        }

        // If user is logged in and tries to access login/register page, redirect to generate
        if (user && PUBLIC_ROUTES.includes(pathname)) {
          return redirect("/generate");
        }
      } catch (error) {
        console.error("Error checking user for public route:", error);
      }
      return next();
    }

    // Verify user authentication
    let user = null;
    try {
      const { data, error } = await locals.supabase.auth.getUser();
      if (error) {
        console.error("User verification error:", error);
        // Clear invalid session
        await locals.supabase.auth.signOut();
      } else {
        user = data.user;
      }
    } catch (error) {
      console.error("Error getting user:", error);
      // Clear potentially corrupted session
      await locals.supabase.auth.signOut();
    }

    // If no authenticated user and not a public route, redirect to login
    if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      if (API_ROUTES.test(pathname)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return redirect("/login");
    }

    // Add verified user to locals
    if (user) {
      locals.user = user;
    }

    return next();
  } catch (error) {
    console.error("Middleware error:", error);
    // On critical error, clear session and redirect to login
    try {
      await locals.supabase.auth.signOut();
    } catch {
      // Ignore signOut errors in critical error handling
    }
    return redirect("/login");
  }
});

export const onRequest = sequence(supabaseMiddleware, authMiddleware);
