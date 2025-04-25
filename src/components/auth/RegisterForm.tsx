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
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number",
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export function RegisterForm() {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: z.infer<typeof registerSchema>) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Note: Backend implementation will be added later
      console.log("Registration attempt:", data);
    } catch (err) {
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
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
        schema={registerSchema}
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
                  <FormMessage />
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
