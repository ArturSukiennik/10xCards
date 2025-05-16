import { z } from "zod";
import type { APIRoute } from "astro";
import { createSupabaseServer, formatAuthError } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: { message: "Content-Type must be application/json" } }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const supabase = createSupabaseServer({
      get: (name) => cookies.get(name)?.value,
      set: (name, value, options) => cookies.set(name, value, options),
    });

    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: formatAuthError(error) }), {
        status: error.status || 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!data.user) {
      return new Response(JSON.stringify({ error: { message: "Authentication failed" } }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Validation failed",
            details: error.errors,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    return new Response(JSON.stringify({ error: formatAuthError(error) }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

export const DELETE: APIRoute = async ({ cookies }) => {
  const supabase = createSupabaseServer({
    get: (name) => cookies.get(name)?.value,
    set: (name, value, options) => cookies.set(name, value, options),
  });

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: formatAuthError(error) }), {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  // Clear all Supabase-related cookies
  const supabaseCookies = [
    "sb-access-token",
    "sb-refresh-token",
    "sb-auth-token",
    "supabase-auth-token",
  ];

  supabaseCookies.forEach((name) => {
    cookies.delete(name, {
      path: "/",
    });
  });

  return new Response(null, {
    status: 204,
    headers: {
      "Clear-Site-Data": '"cookies", "storage"',
    },
  });
};
