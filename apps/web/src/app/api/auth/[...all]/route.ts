/**
 * Better Auth catch-all. Every better-auth endpoint (/sign-up/email,
 * /sign-in/email, /get-session, ...) is served by `auth.handler`. Auth is
 * created lazily here so public pages never initialize it, and a missing
 * BETTER_AUTH_SECRET returns a 503 instead of crashing the function.
 */
import { withAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = (request: Request) => withAuth((auth) => auth.handler(request));
export const POST = (request: Request) => withAuth((auth) => auth.handler(request));
