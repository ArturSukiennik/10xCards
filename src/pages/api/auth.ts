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
      return new Response(JSON.stringify({ error: formatAuthError(error) }), { status: 400 });
    }

    return new Response(
      JSON.stringify({
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      }),
      { status: 200 },
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
        { status: 400 },
      );
    }

    return new Response(JSON.stringify({ error: formatAuthError(error) }), { status: 500 });
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
