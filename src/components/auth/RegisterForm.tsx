"use client";

import * as React from "react";
import * as z from "zod";
import { AuthForm } from "./AuthForm";
import { Link } from "@/components/ui/link";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const registerSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: {
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error?.message || "An error occurred during registration");
        return;
      }

      // Redirect to login page after successful registration
      window.location.href = "/login?registered=true";
    } catch {
      setError("An error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AuthForm
        title="Create an Account"
        buttonText="Sign Up"
        onSubmit={async (data) => {
          await handleSubmit({
            email: data.email,
            password: data.password,
            confirmPassword: data.password,
          });
        }}
        error={error}
        isLoading={isLoading}
        schema={registerSchema}
        defaultValues={{
          email: "",
          password: "",
          confirmPassword: "",
        }}
        extraFields={
          <>
            <FormField
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm your password" {...field} />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <div className="text-sm text-center">
              <Link href="/login" className="text-primary hover:underline">
                Already have an account?
              </Link>
            </div>
          </>
        }
      />
    </div>
  );
}
