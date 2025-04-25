"use client";

import * as React from "react";
import { AuthForm } from "./AuthForm";
import { Link } from "../../components/ui/link";

export function LoginForm() {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Note: Backend implementation will be added later
      console.log("Login attempt:", data);
    } catch {
      setError("An error occurred during login. Please try again.");
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
        error={error}
        isLoading={isLoading}
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
