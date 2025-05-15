import type { SupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient;
      user?: User;
    }
  }
}

export type MiddlewareNext = () => Promise<Response> | Response;

export interface MiddlewareContext {
  locals: App.Locals;
  request: Request;
}

export type MiddlewareHandler = (
  context: MiddlewareContext,
  next: MiddlewareNext
) => Promise<Response> | Response;

// Need this to be a module
export {};
