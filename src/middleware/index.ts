import { defineMiddleware, sequence } from "astro:middleware";
import { onRequest as supabaseMiddleware } from "./supabase";

const PUBLIC_ROUTES = ["/login", "/register"];
const PUBLIC_API_ROUTES = ["/api/auth/register", "/api/auth/login", "/api/auth/session"];
const API_ROUTES = /^\/api\//;

const authMiddleware = defineMiddleware(async ({ locals, request, redirect }, next) => {
  try {
    const url = new URL(request.url);
    const { pathname } = url;

    // Skip auth check for public routes and public API endpoints
    if (PUBLIC_ROUTES.includes(pathname) || PUBLIC_API_ROUTES.includes(pathname)) {
      try {
        const {
          data: { session },
          error,
        } = await locals.supabase.auth.getSession();

        if (error) {
          console.error("Error checking session for public route:", error);
          return next();
        }

        if (session && PUBLIC_ROUTES.includes(pathname)) {
          console.log("Public route, user already logged in, redirecting to /generate");
          return redirect("/generate");
        }
      } catch (error) {
        console.error("Error checking session for public route:", error);
      }
      return next();
    }

    // Get session
    let session;
    try {
      const { data, error } = await locals.supabase.auth.getSession();
      if (error) {
        console.error("Session error:", error);
        session = null;
      } else {
        session = data.session;
        // Only log session check for non-public routes
        if (!PUBLIC_ROUTES.includes(pathname)) {
          console.log("Session check result:", session ? "Session exists" : "No session");
        }
      }
    } catch (error) {
      console.error("Error getting session:", error);
      session = null;
    }

    // If no session and not a public route, redirect to login
    if (!session && !PUBLIC_ROUTES.includes(pathname)) {
      if (API_ROUTES.test(pathname)) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return redirect("/login");
    }

    return next();
  } catch (error) {
    console.error("Middleware error:", error);
    return next();
  }
});

export const onRequest = sequence(supabaseMiddleware, authMiddleware);
