import { defineMiddleware } from "astro:middleware";
import { supabase } from "../lib/supabase";

const PUBLIC_ROUTES = ["/login", "/register"];
const API_ROUTES = /^\/api\//;

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  try {
    const url = new URL(request.url);
    const { pathname } = url;

    // Skip auth check for public routes
    if (PUBLIC_ROUTES.includes(pathname)) {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
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
      const { data } = await supabase.auth.getSession();
      session = data.session;
    } catch (error) {
      console.error("Error getting session:", error);
      // Proceed as unauthenticated on error
      session = null;
    }

    // Handle API routes
    if (API_ROUTES.test(pathname)) {
      if (!session) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      return next();
    }

    // Handle page routes
    if (!session) {
      const searchParams = new URLSearchParams();
      searchParams.set("from", pathname);
      return redirect(`/login?${searchParams.toString()}`);
    }

    // User is authenticated, proceed
    return next();
  } catch (error) {
    console.error("Middleware error:", error);
    // Fallback to next() on unexpected errors to prevent complete site breakdown
    return next();
  }
});
