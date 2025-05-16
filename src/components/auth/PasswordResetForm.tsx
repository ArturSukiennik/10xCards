"use client";

import * as React from "react";
import * as z from "zod";
import { AuthForm } from "./AuthForm";
import { Link } from "@/components/ui/link";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export function PasswordResetForm() {
  const [error, setError] = React.useState<string>();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (data: z.infer<typeof resetSchema>) => {
    setIsLoading(true);
    setError(undefined);

    try {
      // Note: Backend implementation will be added later
      console.log("Password reset attempt:", data);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <AuthForm
        title="Reset Password"
        buttonText="Send Reset Link"
        onSubmit={handleSubmit}
        error={error}
        isLoading={isLoading}
        schema={resetSchema}
        extraFields={
          <div className="text-sm text-center">
            <Link href="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </div>
        }
      />
    </div>
  );
}
