import { betterAuth } from "better-auth";
import type { BetterAuthOptions } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import * as schema from "@/db/schema";

// IMPORTANT: Better Auth must not be instantiated at module load time on
// Vercel — `next build` evaluates this file while DATABASE_URL is unset,
// and better-auth will try to validate the DB adapter. Build a getter so
// the auth instance is only created the first time a request comes in.
export type AuthInstance = ReturnType<typeof betterAuth>;
let _auth: AuthInstance | null = null;

export function getAuth(): AuthInstance {
  if (!_auth) {
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      throw new Error(
        "BETTER_AUTH_SECRET is not set. Add it in Vercel Project → Settings → Environment Variables."
      );
    }
    const options: BetterAuthOptions = {
      database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
          user: schema.user,
          session: schema.session,
          account: schema.account,
          verification: schema.verification,
        },
      }),
      secret,
      baseURL: process.env.BETTER_AUTH_URL,
      socialProviders: {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID!,
          clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        },
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        },
      },
      session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      },
      account: {
        accountLinking: {
          enabled: true,
          trustedProviders: ["github", "google"],
        },
      },
    };
    _auth = betterAuth(options);
  }
  return _auth;
}

// Export a Proxy so `auth.handler`, `auth.api.getSession(...)` etc. work
// the same way as before — the underlying instance is created on first access.
export const auth = new Proxy({} as AuthInstance, {
  get(_target, prop) {
    const target = getAuth() as unknown as Record<string | symbol, unknown>;
    const value = target[prop];
    return typeof value === "function" ? (value as Function).bind(target) : value;
  },
});

export type Auth = AuthInstance;
