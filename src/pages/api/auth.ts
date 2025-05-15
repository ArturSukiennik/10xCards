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
      console.error("Invalid Content-Type:", request.headers.get("Content-Type"));
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
    console.log("Received login request for email:", body.email);

    const validatedData = loginSchema.parse(body);

    const supabase = createSupabaseServer({
      get: (name) => {
        const value = cookies.get(name)?.value;
        console.log(
          "Reading cookie in auth endpoint:",
          name,
          "value:",
          value ? "exists" : "undefined",
        );
        return value;
      },
      set: (name, value, options) => {
        console.log("Setting cookie in auth endpoint:", name, "options:", options);
        cookies.set(name, value, options);
      },
    });

    console.log("Attempting to sign in with password...");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Supabase auth error:", error);
      return new Response(JSON.stringify({ error: formatAuthError(error) }), {
        status: error.status || 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!data.user) {
      console.error("Authentication succeeded but no user data returned");
      return new Response(JSON.stringify({ error: { message: "Authentication failed" } }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Authentication successful for user:", data.user.email);
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
    console.error("Unexpected error in auth endpoint:", error);
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
