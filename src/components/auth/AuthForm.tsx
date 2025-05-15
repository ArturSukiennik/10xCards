"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Base schema for auth forms
const baseAuthSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type BaseAuthSchemaType = z.infer<typeof baseAuthSchema>;

export interface AuthFormProps {
  onSubmit: (data: BaseAuthSchemaType) => Promise<void>;
  title: string;
  buttonText: string;
  error?: string;
  isLoading?: boolean;
  extraFields?: React.ReactNode;
  schema?: z.ZodType<BaseAuthSchemaType>;
  defaultValues?: Partial<BaseAuthSchemaType>;
}

export function AuthForm({
  onSubmit,
  title,
  buttonText,
  error,
  isLoading = false,
  extraFields,
  schema = baseAuthSchema,
  defaultValues = {
    email: "",
    password: "",
  },
}: AuthFormProps) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = async (data: z.infer<typeof schema>) => {
    try {
      await onSubmit(data);
    } catch {
      // Error handling is done by the parent component
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto" data-test-id="auth-form">
      <CardHeader>
        <CardTitle data-test-id="auth-form-title" className="text-2xl font-bold text-center">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert
            data-test-id="error-message"
            variant="destructive"
            className="mb-4 bg-red-500 text-white border-red-500"
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form
            data-test-id="auth-form"
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      data-test-id="email-input"
                      type="email"
                      placeholder="Enter your email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      data-test-id="password-input"
                      type="password"
                      placeholder="Enter your password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            {extraFields}
            <Button
              data-test-id="login-button"
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white focus:ring-green-500"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : buttonText}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
