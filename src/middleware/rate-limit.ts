import type { MiddlewareHandler } from "../types/astro";
import { supabase } from "@/lib/supabase";

const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const createRateLimitMiddleware = (limit: number, windowMs = 60000): MiddlewareHandler => {
  return async ({ request }, next) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id || request.headers.get("x-forwarded-for") || "anonymous";
    const now = Date.now();

    const userLimit = rateLimits.get(userId);
    if (!userLimit || now > userLimit.resetTime) {
      rateLimits.set(userId, { count: 1, resetTime: now + windowMs });
    } else {
      userLimit.count++;
      if (userLimit.count > limit) {
        return new Response(JSON.stringify({ error: "Too many requests" }), {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((userLimit.resetTime - now) / 1000)),
          },
        });
      }
    }

    return next();
  };
};
