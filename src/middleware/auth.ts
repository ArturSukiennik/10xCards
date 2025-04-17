import type { MiddlewareHandler, MiddlewareContext, MiddlewareNext } from '../types/astro';
import { AuthorizationError } from '../lib/errors';

export const authMiddleware: MiddlewareHandler = async (
  { locals, request }: MiddlewareContext,
  next: MiddlewareNext
) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthorizationError('Missing or invalid authorization header');
  }

  try {
    const { data: { user }, error } = await locals.supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (error || !user) {
      throw new AuthorizationError('Invalid token');
    }

    // Add user to locals for use in routes
    locals.user = user;
    
    return next();
  } catch (error) {
    throw new AuthorizationError('Authentication failed');
  }
}; 