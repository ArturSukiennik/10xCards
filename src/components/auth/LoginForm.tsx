"use client";

import * as React from "react";
import * as z from "zod";
import { AuthForm } from "./AuthForm";
import { Link } from "../ui/link";
import { useAuthStore } from "@/lib/stores/authStore";
import type { AuthError, LoginCredentials } from "@/types";

// Schemat logowania - tylko podstawowa walidacja
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

interface LoginFormProps {
  redirectTo?: string;
}

export function LoginForm({ redirectTo = "/generate" }: LoginFormProps) {
  const [error, setError] = React.useState<AuthError>();
  const [isLoading, setIsLoading] = React.useState(false);
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setError(undefined);

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include", // Important: include cookies in the request
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Login error:", result.error);
        // Używamy standardowego komunikatu dla niepoprawnych danych logowania
        setError({
          message: "Wrong credentials",
          code: "INVALID_CREDENTIALS",
        });
        return;
      }

      if (!result.user) {
        setError({
          message: "Invalid response from server",
          code: "INVALID_RESPONSE",
        });
        return;
      }

      setUser(result.user);

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Use window.location.replace for a clean redirect
      window.location.replace(redirectTo);
    } catch (error) {
      console.error("Login error:", error);
      setError({
        message: "An error occurred during login. Please try again.",
        code: "NETWORK_ERROR",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AuthForm
        title="Login"
        buttonText="Sign In"
        onSubmit={handleSubmit}
        error={error?.message}
        isLoading={isLoading}
        schema={loginSchema}
        extraFields={
          <div className="flex justify-between text-sm">
            <Link href="/register" className="text-primary hover:underline">
              Have no account?
            </Link>
            <Link href="/reset-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        }
      />
    </div>
  );
}
