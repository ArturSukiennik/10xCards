import type { APIRoute } from "astro";
import { createSupabaseServer, formatAuthError } from "@/lib/supabase";

export const prerender = false;

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabase = createSupabaseServer({
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
    });

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return new Response(JSON.stringify({ error: formatAuthError(error) }), {
        status: error.status || 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!user) {
      return new Response(JSON.stringify({ user: null }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: formatAuthError(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};
