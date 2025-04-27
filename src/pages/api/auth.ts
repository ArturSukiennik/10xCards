import { z } from "zod";
import type { APIRoute } from "astro";
import { createSupabaseServer, formatAuthError } from "@/lib/supabase";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
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
    console.log("Attempting to validate login data for email:", body.email);

    let validatedData;
    try {
      validatedData = loginSchema.parse(body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      throw validationError;
    }

    console.log("Creating Supabase server client");
    const supabase = createSupabaseServer({
      get: (name) => {
        const cookie = cookies.get(name)?.value;
        console.log("Getting cookie:", name, "value exists:", !!cookie);
        return cookie;
      },
      set: (name, value, options) => {
        console.log("Setting cookie:", name);
        cookies.set(name, value, options);
      },
    });

    console.log("Attempting to sign in with password");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      console.error("Supabase auth error:", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      return new Response(JSON.stringify({ error: formatAuthError(error) }), {
        status: error.status || 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    if (!data.user) {
      console.error("No user data returned from Supabase");
      return new Response(JSON.stringify({ error: { message: "Authentication failed" } }), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    console.log("Successfully authenticated user:", data.user.email);
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
    console.error("Auth error:", error);

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
    return new Response(JSON.stringify({ error: formatAuthError(error) }), { status: 400 });
  }

  return new Response(null, { status: 204 });
};
