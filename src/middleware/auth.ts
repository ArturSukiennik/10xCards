import type { MiddlewareHandler, MiddlewareContext, MiddlewareNext } from '../types/astro';
import { AuthorizationError } from '../lib/errors';

// Mocked user for development
const MOCK_USER = {
  id: 'mock-user-id-123',
  email: 'mock@example.com',
  role: 'authenticated',
  aud: 'authenticated',
  app_metadata: {},
  user_metadata: {},
  created_at: new Date().toISOString()
};

export const authMiddleware: MiddlewareHandler = async (
  { locals, request }: MiddlewareContext,
  next: MiddlewareNext
) => {
  // Skip real authentication and use mock user
  locals.user = MOCK_USER;
  return next();
}; 