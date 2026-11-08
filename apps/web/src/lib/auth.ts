/**
 * ⚠ ANYTHING PLATFORM — DO NOT REWRITE THIS FILE ⚠
 *
 * Shipped v2 better-auth configuration. The hooks.before middleware (backfills
 * `name` from email), bearer() plugin (mobile Authorization: Bearer flow),
 * trustedOrigins list, and socialProviders block are ALL load-bearing. A prior
 * AI removed the name backfill and broke every signup with [body.name]
 * validation errors. DO NOT simplify this config without understanding why each
 * piece is present.
 *
 *   Safe:   add user fields to `user.additionalFields`, tune session options.
 *   Unsafe: removing hooks.before, the bearer plugin, or trustedOrigins;
 *           changing cookie attributes (sameSite:'none' is required for
 *           mobile iframes); changing the database pool; hand-editing the
 *           socialProviders block (the platform injects the OAuth credentials
 *           via env vars when a provider is enabled in project settings).
 */
import { Pool, neonConfig } from '@neondatabase/serverless';
import { argon2Verify } from 'argon2-wasm-edge';
import { betterAuth } from 'better-auth';
import { createAuthMiddleware } from 'better-auth/api';
import { verifyPassword } from 'better-auth/crypto';
import { bearer } from 'better-auth/plugins';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

/**
 * Better Auth is created lazily (on first use inside an auth/admin route) so
 * public pages never initialize it. When BETTER_AUTH_SECRET is missing we
 * throw AuthNotConfiguredError synchronously, which callers turn into a 503,
 * instead of letting better-auth raise an unhandled promise rejection that
 * crashes the whole server function.
 */
export class AuthNotConfiguredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthNotConfiguredError';
  }
}

// Netlify provides URL (primary site URL) and DEPLOY_PRIME_URL automatically.
const baseURL = process.env.BETTER_AUTH_URL || process.env.URL || undefined;

// Origins we accept auth requests from. Include every URL the app may be
// served under so better-auth's CSRF check doesn't reject legitimate requests
// as "Invalid origin". The request's own origin + known sandbox / published
// URLs + the mobile iframe proxy URL are all listed here.
//
// BETTER_AUTH_TRUSTED_ORIGINS is a comma-separated list the platform sets at
// publish time to every attached free-host + custom domain. Without it, only
// the first published URL (historically the free host) is trusted and signup
// on a custom domain returns INVALID_ORIGIN after domain attach.
const trustedOrigins = Array.from(
  new Set(
    [
      process.env.BETTER_AUTH_URL,
      process.env.URL,
      process.env.DEPLOY_PRIME_URL,
      process.env.EXPO_PUBLIC_PROXY_BASE_URL,
      process.env.NEXT_PUBLIC_CREATE_BASE_URL,
      process.env.NEXT_PUBLIC_CREATE_HOST ? `https://${process.env.NEXT_PUBLIC_CREATE_HOST}` : null,
      ...(process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ].filter((v): v is string => Boolean(v))
  )
);

// Social providers self-activate when the platform has injected their OAuth
// credentials (set in project settings → Authentication, pushed in as env
// vars). A provider with missing credentials is simply not registered, so the
// corresponding sign-in button never reaches a half-configured backend.
const socialProviders = {
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }
    : {}),
  ...(process.env.APPLE_CLIENT_ID && process.env.APPLE_CLIENT_SECRET
    ? {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID,
          clientSecret: process.env.APPLE_CLIENT_SECRET,
          // Required to verify the identity token from native "Sign in with
          // Apple"; harmless when only web is used.
          ...(process.env.APPLE_APP_BUNDLE_IDENTIFIER
            ? {
                appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER,
              }
            : {}),
        },
      }
    : {}),
};

async function verifyCompatiblePassword({ hash, password }: { hash: string; password: string }) {
  if (hash.startsWith('$argon2')) {
    return argon2Verify({
      hash,
      password,
    });
  }

  return verifyPassword({
    hash,
    password,
  });
}

function createAuth() {
  return betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
  trustedOrigins,
  socialProviders,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    password: {
      verify: verifyCompatiblePassword,
    },
  },
  hooks: {
    // better-auth's /sign-up/email schema requires `name`. Generated user apps
    // often collect only email+password, so backfill a name from the email
    // local-part to keep signup working without a visible name field.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path !== '/sign-up/email') return;
      const body = ctx.body as { email?: unknown; name?: unknown } | undefined;
      if (!body || typeof body.email !== 'string') return;
      if (typeof body.name === 'string' && body.name.trim().length > 0) return;
      const derived = body.email.split('@')[0];
      body.name = derived && derived.length > 0 ? derived : 'User';
    }),
  },
  advanced: {
    cookiePrefix: 'better-auth',
    defaultCookieAttributes: {
      sameSite: 'none', // Required for iframes
      secure: true,
      httpOnly: true,
      path: '/',
    },
    cookies: {
      sessionToken: {
        attributes: {
          sameSite: 'none', // Required for iframes
          secure: true,
        },
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 days
    },
  },
  user: {
    additionalFields: {
      image: {
        type: 'string',
        required: false,
      },
    },
  },
  // Enable Authorization: Bearer <session-token> so mobile apps (which can't
  // carry cookies through a WebView) authenticate API calls with the token
  // returned from /api/auth/token.
  plugins: [bearer()],
  });
}

type Auth = ReturnType<typeof createAuth>;
let authInstance: Auth | null = null;

/** Returns the Better Auth instance, creating it on first call. */
export function getAuth(): Auth {
  if (authInstance) return authInstance;
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new AuthNotConfiguredError(
      'Admin login is not configured: BETTER_AUTH_SECRET is not set.'
    );
  }
  const instance = createAuth();
  // better-auth initializes its context asynchronously; make sure a failure
  // there can never surface as an unhandled rejection.
  Promise.resolve(instance.$context).catch((err) => {
    console.error('[auth] Better Auth failed to initialize:', err);
    authInstance = null;
  });
  authInstance = instance;
  return instance;
}

/** Runs `fn` with the auth instance; returns a 503 when auth is not configured or fails. */
export async function withAuth(fn: (auth: Auth) => Promise<Response> | Response): Promise<Response> {
  try {
    return await fn(getAuth());
  } catch (err) {
    const notConfigured =
      err instanceof AuthNotConfiguredError ||
      (err instanceof Error && /default secret|BETTER_AUTH_SECRET/i.test(err.message));
    console.error('[auth]', err);
    return Response.json(
      {
        error: notConfigured
          ? 'Login is temporarily unavailable (auth not configured).'
          : 'Authentication error',
      },
      { status: notConfigured ? 503 : 500 }
    );
  }
}

export type Session = Auth['$Infer']['Session'];
